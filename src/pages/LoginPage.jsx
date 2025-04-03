import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem("user");
    console.log("login:", isLoggedIn);

    if (isLoggedIn) {
      navigate("/dashboard/general");
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    let user = null;
    if (username === "admin" && password === "admin") {
      user = "admin";
    } else if (username === "meibeichi" && password === "meibeichi") {
      user = "meibeichi";
    } else {
      toast.error("Invalid username or password.");
    }
    localStorage.setItem("user", user);
    toast.success(`Welcome back, ${user}!`);
    navigate("/dashboard/general");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Meibeichi</CardTitle>
          <CardDescription>Đăng nhập thông tin tài khoản người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="username">Tài khoản</Label>
            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nhập tên tài khoản..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu..." required />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin}>
            Đăng nhập
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
