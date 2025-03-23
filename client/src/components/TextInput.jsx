export const TextInput = ({ icon: Icon, label, ...props }) => {
    return (
      <div className="flex flex-col w-full">
        {label && (
          <label className="text-foreground mb-1 text-sm font-medium">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              className="absolute left-3 top-2.5 text-gray-500"
              size={20}
            />
          )}
          <input
            {...props}
            className={`
              w-full border rounded-xl px-4 py-2 focus:outline-none 
              focus:ring-2 focus:ring-primary focus:border-transparent
              ${Icon ? "pl-10" : "pl-4"}
              border-border text-foreground bg-card
            `}
          />
        </div>
      </div>
    );
  };