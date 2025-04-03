import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";

function PrivateRoute() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setIsLoading(false);
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  return <Outlet />;
}

export default PrivateRoute;
