const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div style={{ textAlign: "center" }}>
        <h1>Oops! Something went wrong.</h1>
        <p>We're sorry, but an unexpected error occurred.</p>
      </div>
      <button
        className="button px-[20px] py-[8px] rounded-[20px] bg-[#6284F5] text-white mt-[20px]"
        onClick={() => window.location.reload()}
      >
        Reload Page
      </button>
    </div>
  );
};

export default ErrorPage;
