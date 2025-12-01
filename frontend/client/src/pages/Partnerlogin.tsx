import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Building2, Mail, Lock, Stethoscope } from "lucide-react";

type PartnerRole = "retailer" | "wholesaler";

export default function PartnerLogin() {
  const [role, setRole] = useState<PartnerRole>("retailer");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/partner-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();

    if (res.ok) {
  setIsError(false);
  setMessage("Login successful! Redirecting...");

  localStorage.setItem("userId", data.userId);
  localStorage.setItem("role", data.role); // "retailer" | "wholesaler"

  if (data.role === "retailer") {
    navigate("/retailer");
  } else if (data.role === "wholesaler") {
    navigate("/wholesaler");
  }
}

 else {
        setIsError(true);
        setMessage(data.message || "Login failed.");
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Error submitting form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RoleIcon = role === "retailer" ? Store : Building2;
  const roleTitle = role === "retailer" ? "Retailer" : "Wholesaler";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
          {/* LEFT INFO SECTION */}
          <div className="hidden md:block">
            <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Stethoscope className="w-4 h-4 mr-2" />
              MedEasy • Partner Access
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Login as a <span className="text-primary">Retailer</span> or{" "}
              <span className="text-primary">Wholesaler</span>
            </h1>

            <p className="text-muted-foreground mb-6">
              Manage stock, fulfill orders, and respond to requests through a unified MedEasy partner dashboard.
            </p>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-primary" />
                Real-time visibility into medicine demand and nearby consumers.
              </li>
              <li className="flex items-start">
                <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-primary" />
                Streamlined ordering between retailers and wholesalers.
              </li>
              <li className="flex items-start">
                <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-primary" />
                Secure login and access tailored to your role.
              </li>
            </ul>
          </div>

          {/* RIGHT: PARTNER LOGIN CARD */}
          <Card className="shadow-lg overflow-hidden">
            {/* Gradient header like dashboard */}
            <div className="gradient-bg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Partner Login
                  </CardTitle>
                  <CardDescription className="text-white/80 mt-1">
                    Sign in as a {roleTitle.toLowerCase()} to access your tools
                  </CardDescription>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <RoleIcon className="w-6 h-6" />
                </div>
              </div>

              {/* Role toggle */}
              <div className="mt-4 inline-flex bg-white/10 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setRole("retailer")}
                  className={`flex items-center px-4 py-1.5 text-xs font-medium rounded-full transition ${
                    role === "retailer"
                      ? "bg-white text-primary"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Store className="w-4 h-4 mr-1.5" />
                  Retailer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("wholesaler")}
                  className={`flex items-center px-4 py-1.5 text-xs font-medium rounded-full transition ${
                    role === "wholesaler"
                      ? "bg-white text-primary"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Building2 className="w-4 h-4 mr-1.5" />
                  Wholesaler
                </button>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="store@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

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

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Use credentials provided during partner onboarding.</span>
                  <button
                    type="button"
                    className="underline hover:text-primary"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting
                    ? `Logging in as ${roleTitle}...`
                    : `Login as ${roleTitle}`}
                </Button>
              </form>

              {message && (
                <p
                  className={`text-sm text-center ${
                    isError ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="text-xs text-center text-muted-foreground mt-4">
                Not a partner yet?{" "}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => navigate("/signup")}
                >
                  Request access
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
