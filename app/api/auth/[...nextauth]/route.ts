import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabaseAdmin } from "@/lib/supabase/server"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const { data: existingUser } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single()

          if (!existingUser) {
            // Create new user
            await supabaseAdmin.from("users").insert({
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              google_id: account.providerAccountId,
              credits_remaining: 10,
              subscription_status: "trial",
              trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            })
          } else {
            // Update existing user
            await supabaseAdmin
              .from("users")
              .update({
                name: user.name,
                avatar_url: user.image,
                google_id: account.providerAccountId,
              })
              .eq("email", user.email)
          }
          return true
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session?.user) {
        // Fetch user data from Supabase
        const { data: userData } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", session.user.email)
          .single()

        if (userData) {
          session.user = {
            ...session.user,
            id: userData.id,
            credits: userData.credits_remaining,
            subscriptionStatus: userData.subscription_status,
            subscriptionPlan: userData.subscription_plan,
          }
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
