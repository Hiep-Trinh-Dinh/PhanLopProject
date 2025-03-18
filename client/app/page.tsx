import { redirect } from "next/navigation"
import LoginPage from "@/components/auth/login-page"

export default function Home() {
  // In a real app, you would check if the user is authenticated
  // const isAuthenticated = checkAuth();
  const isAuthenticated = false

  if (isAuthenticated) {
    redirect("/home")
  }

  return <LoginPage />
}

