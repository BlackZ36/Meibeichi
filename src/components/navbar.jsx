import { useEffect, useState } from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/theme-provider";
import { Link, useNavigate } from "react-router-dom";

export function Navbar() {
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoggingOut(false);
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const themeColor = theme === "dark" ? "#020817" : "#fff";
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) metaThemeColor.setAttribute("content", themeColor);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" mx-10 flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <span className="font-bold text-xl">
              Meibeichi
              <span className="text-primary font-bold">.</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button variant="outline" size="icon" className="scale-95 rounded-full" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Moon className="size-[1.2rem]" />
            ) : theme === "light" ? (
              <Sun className="size-[1.2rem]" />
            ) : (
              <Sun className="size-[1.2rem] opacity-50" /> // Biểu tượng cho chế độ hệ thống
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User avatar and logout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://scontent.fhan14-4.fna.fbcdn.net/v/t39.30808-1/440430978_3290710631073533_5982886404578137015_n.jpg?stp=c0.0.809.809a_dst-jpg_s200x200_tt6&_nc_cat=107&ccb=1-7&_nc_sid=e99d92&_nc_ohc=h6BIhhBiWP0Q7kNvwHHOrAW&_nc_oc=Admhqpi37pZNNacLjQFDt-JXXRvVsau7AGr8r81RylwRq0BGxuSG9KCyHA47lqH2gN0&_nc_zt=24&_nc_ht=scontent.fhan14-4.fna&_nc_gid=S7oSrsqtuVv51_JqSkD1ig&oh=00_AYEqZDhj55noJt6045duHqsS-oWz_GzDfdD73rT4xcxvkg&oe=67F6F506" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
