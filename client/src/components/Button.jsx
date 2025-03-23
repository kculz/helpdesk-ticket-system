export const Button = ({ icon: Icon, children, className, ...props }) => {
    return (
      <button
        {...props}
        className={`
          flex items-center justify-center gap-2 px-4 py-2 
          bg-primary text-white font-semibold rounded-xl 
          hover:bg-secondary transition-all
          ${className}
        `}
      >
        {Icon && <Icon size={20} />}
        {children}
      </button>
    );
  };