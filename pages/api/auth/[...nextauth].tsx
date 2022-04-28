import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import Auth0Provider from 'next-auth/providers/auth0'

import conta from "../../../utils/bdconta"

const ct = new conta(process.env.MONGODB_COLECAO_CONTAS!)

export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, {
    
    providers: [
        Auth0Provider({
            clientId: process.env.AUTH0_CLIENT_ID!,
            clientSecret: process.env.AUTH0_CLIENT_SECRET!,
            issuer: process.env.AUTH0_ISSUER
        })
    ],
    
    secret: process.env.NEXTAUTH_SECRET,
    
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            console.log("->[...nextauth].tsx callbacks signIn")
            const usuario = await ct.findOneProfile(profile)
            if (usuario) {
                await ct.replaceOneProfile(profile)
            } else {
                await ct.insertOneProfile(profile)
            }
            if (!profile.email_verified) {
                return false
            }
            return true
        },
        async redirect({ url, baseUrl }) {
            console.log("->[...nextauth].tsx callbacks redirect")
            return baseUrl
        },
        async session({ session, user, token }) {
            console.log("->[...nextauth].tsx callbacks session")
            return session
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            console.log("->[...nextauth].tsx callbacks jwt")
            return token
        }
    },

    pages: {
        //signIn: '/auth/signin',
        //signOut: '/auth/signout',
        error: '/auth/error', // Error code passed in query string as ?error=
        //verifyRequest: '/auth/verify-request', // (used for check email message)
        //newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    },
})