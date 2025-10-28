import { useEffect } from "react";

const Apply = () => {
  useEffect(() => {
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSdTeV7UaZ1MiFxdJ2jH_PU60PIN3iqYJ1WXEOFY45TsAy6O5g/viewform?usp=publish-editor";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="mt-4 text-sm text-gray-400">Redirecting to application form...</div>
      </div>
    </div>
  );
};

export default Apply;
