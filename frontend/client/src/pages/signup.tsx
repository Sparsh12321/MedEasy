import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Stethoscope } from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await res.json();

      if (res.ok) {
  setIsError(false);
  setMessage("Signup successful! Redirecting...");

  localStorage.setItem("userId", data.userId);
  localStorage.setItem("role", data.role); // "customer"

  // redirect based on role
  if (data.role === "retailer") {
    navigate("/retailer");
  } else if (data.role === "wholesaler") {
    navigate("/wholesaler");
  } else {
    navigate("/dashboard");   // ✅ go to consumer dashboard
  }
}

 else {
        setIsError(true);
        setMessage(data.message || "Signup failed.");
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Server error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">

          {/* LEFT INFO SECTION */}
          <div className="hidden md:block">
            <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Stethoscope className="w-4 h-4 mr-2" />
              MedEasy • Create Your Account
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Join <span className="text-primary">MedEasy</span> Today
            </h1>

            <p className="text-muted-foreground mb-6">
              Sign up to access medicine availability, order tracking, and personalized dashboards.
            </p>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-primary" />
                Manage your prescriptions and orders easily.
              </li>
              <li className="flex items-start">
                <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-primary" />
                Retailers and wholesalers can manage inventory and requests.
              </li>
              <li className="flex items-start">
                <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-primary" />
                Secure authentication and smooth experience.
              </li>
            </ul>
          </div>

          {/* SIGNUP CARD */}
          <Card className="shadow-lg overflow-hidden">

            {/* Gradient Header like Dashboard */}
            <div className="gradient-bg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                  <CardDescription className="text-white/80 mt-1">
                    Sign up to start using MedEasy
                  </CardDescription>
                </div>

                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                  >
                    <option value="customer">Customer</option>
                    <option value="retailer">Retailer</option>
                    <option value="wholesaler">Wholesaler</option>
                  </select>
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>

              {message && (
                <p
                  className={`text-sm text-center ${isError ? "text-red-500" : "text-green-600"}`}
                >
                  {message}
                </p>
              )}

              <div className="text-xs text-center text-muted-foreground mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
