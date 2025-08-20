import React from "react";

interface Props {
  error?: string;
  status?: string;
  success?: string;
}

const Alert = ({ error, status, success }: Props) => {
  return (
    <div>
      {error && (
        <div
          role="alert"
          className="alert alert-error absolute top-4 max-md:top-auto max-md:bottom-4 left-1/2 -translate-x-1/2 w-fit z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
      {status && (
        <div
          role="alert"
          className="alert absolute top-4 max-md:top-auto max-md:bottom-4 left-1/2 -translate-x-1/2 w-fit z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info h-6 w-6 shrink-0"
          >
            <path
              strokeLinecap="round"
              stroke-linejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{status}</span>
        </div>
      )}
      {success && (
        <div
          role="alert"
          className="alert alert-success absolute top-4 left-1/2 -translate-x-1/2 w-fit z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              stroke-linejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};

export default Alert;
