"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";
import { JSX } from "react";

function SignUp(): JSX.Element {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-r from-indigo-100 to-blue-200 p-6">
      <h1 className="text-3xl font-bold text-indigo-900 mb-6 text-center">
        Create Your Account
      </h1>

      {/* Sign-Up Form */}
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
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
            className="w-full mt-1 p-3 border rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-4">
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
            className="w-full mt-1 p-3 border rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
            placeholder="Enter your password"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm-password"
            name="confirm-password"
            className="w-full mt-1 p-3 border rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
            placeholder="Confirm your password"
          />
        </div>

        {/* Sign Up & Social Login Buttons */}
        <div className="flex flex-col space-y-3 mt-4">
          <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700 hover:cursor-pointer">
            SIGN UP
          </Button>
          <span className="text-center">OR</span>
          <Button className="w-full bg-red-600 text-white hover:bg-red-700  hover:cursor-pointer">
            SIGN UP WITH GOOGLE
          </Button>
          <Button className="w-full bg-blue-600 text-white hover:bg-blue-700  hover:cursor-pointer">
            SIGN UP WITH MICROSOFT
          </Button>
        </div>
        {/* redirection to sign in */}
        <div className="flex justify-center m-3 text-blue-500 underline font-bold">
          <span>
            <Link href="/">Sign In</Link>
          </span>
        </div>
      </div>
    </section>
  );
}

export default SignUp;
