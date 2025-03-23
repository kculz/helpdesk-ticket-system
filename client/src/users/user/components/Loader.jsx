import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Loader = ({ type = "viewTicket" }) => {
  // Loader for ViewTicket component
  if (type === "viewTicket") {
    return (
      <div className="bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Ticket Details Skeleton */}
          <div className="bg-card rounded-xl shadow-soft border border-border p-6 mb-6">
            <Skeleton height={24} width={200} style={{ marginBottom: "16px" }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton height={20} width={150} />
              <Skeleton height={20} width={150} />
              <Skeleton height={20} width={150} />
              <Skeleton height={20} width={150} />
            </div>
          </div>

          {/* Chat or Rating Section Skeleton */}
          <div className="bg-card rounded-xl shadow-soft border border-border p-6 mb-6">
            <Skeleton height={24} width={200} style={{ marginBottom: "16px" }} />
            <Skeleton height={100} />
          </div>
        </div>
      </div>
    );
  }

  // Loader for TicketChat component
  if (type === "ticketChat") {
    return (
      <div className="flex flex-col bg-background p-6">
        {/* Chat Messages Skeleton */}
        <div className="flex-1 overflow-y-auto mb-6">
          <div className="max-w-2xl mx-auto">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex mb-4">
                <Skeleton height={80} width={300} />
              </div>
            ))}
          </div>
        </div>

        {/* Input Area Skeleton */}
        <div className="max-w-2xl mx-auto w-full bg-card p-4 rounded-xl border border-border md:mt-20 mt-10">
          <Skeleton height={40} />
        </div>
      </div>
    );
  }

  // Loader for Profile component
  if (type === "profile") {
    return (
      <div className="bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Information Skeleton */}
          <div className="bg-card rounded-xl shadow-soft border border-border p-6">
            <Skeleton height={24} width={200} style={{ marginBottom: "16px" }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} height={40} />
              ))}
            </div>
          </div>

          {/* Additional Information Skeleton */}
          <div className="bg-card rounded-xl shadow-soft border border-border p-6 mt-6">
            <Skeleton height={24} width={200} style={{ marginBottom: "16px" }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton height={20} width={150} />
              <Skeleton height={20} width={150} />
              <Skeleton height={20} width={150} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loader for TicketsList component
  if (type === "ticketsList") {
    return (
      <div className="p-6 bg-background">
        {/* Filter Options Skeleton */}
        <div className="mb-6">
          <Skeleton height={40} width={200} />
        </div>

        {/* Tickets Table Skeleton */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-card border-b border-border">
                {[...Array(5)].map((_, index) => (
                  <th key={index} className="p-3 text-left text-sm font-medium text-foreground">
                    <Skeleton height={20} width={100} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="border-b border-border">
                  {[...Array(5)].map((_, index) => (
                    <td key={index} className="p-3 text-sm text-foreground">
                      <Skeleton height={20} width={100} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Default Skeleton Loader
  return (
    <div>
      <Skeleton height={30} width={200} style={{ marginBottom: "10px" }} />
      <Skeleton height={20} width={150} style={{ marginBottom: "5px" }} />
      <Skeleton height={20} width={250} style={{ marginBottom: "5px" }} />
      <Skeleton height={20} width={250} style={{ marginBottom: "5px" }} />
    </div>
  );
};

export default Loader;