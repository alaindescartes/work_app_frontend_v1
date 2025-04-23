"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { JSX } from "react";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StaffData } from "@/interfaces/staffINterface";
import { useDispatch } from "react-redux";
import { userSignIn } from "@/redux/slices/userSlice";
import { toast } from "sonner";

function SignIn(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPassword(e.target.value);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("All fields must be provided");
      return;
    }
    try {
      setIsLoading(true);
      const data = { email, password };
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        const staff: StaffData = result.staffData;
        dispatch(userSignIn(staff));
        toast("Suceessfully logged in", {
          style: { backgroundColor: "green", color: "white" },
        });
        router.push("/dashboard/home");
        return;
      }
    } catch (error) {
      console.error(error);
      setError("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <section className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-r from-amber-100 to-yellow-200 p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
        Documentation at your fingertips...
      </h1>

      {/* Sign-in form */}
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        {error && <div className="text-red-700 text-center">{error}</div>}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`w-full mt-1 p-3 border rounded-md focus:ring-2 outline-none 
          ${
            error
              ? "border-red-500 focus:ring-red-400 focus:border-red-400"
              : "focus:ring-blue-400 focus:border-blue-400"
          }`}
            placeholder={"Enter your email"}
            value={email}
            onChange={handleEmailChange}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={`w-full mt-1 p-3 border rounded-md focus:ring-2 outline-none 
              ${
                error
                  ? "border-red-500 focus:ring-red-400 focus:border-red-400"
                  : "focus:ring-blue-400 focus:border-blue-400"
              }`}
            placeholder={"Enter your email"}
            onChange={handlePasswordChange}
          />
        </div>

        {/* Other login methods */}
        <div className="flex flex-col space-y-3 mt-4">
          <Button
            className="w-full bg-green-600 text-white hover:bg-green-700 hover:cursor-pointer"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            LOG IN
          </Button>
          <span className="text-center">OR</span>
          <Button
            className="w-full bg-red-600 text-white hover:bg-red-700 hover:cursor-pointer"
            disabled={isLoading}
          >
            LOG IN WITH GOOGLE
          </Button>
          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700  hover:cursor-pointer"
            disabled={isLoading}
          >
            LOG IN WITH MICROSOFT
          </Button>
        </div>
        {/* redirection to sign up */}
        <div className="flex justify-center m-3 text-blue-500 underline font-bold">
          <span>
            <Link href="sign-up">Sign Up</Link>
          </span>
        </div>
      </div>
    </section>
  );
}

export default SignIn;
