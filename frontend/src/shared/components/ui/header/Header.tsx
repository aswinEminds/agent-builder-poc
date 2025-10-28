import Logo from "../logo/Logo";

interface HeaderProps {
  centerElements?: React.ReactNode;
  rightElements?: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  centerElements,
  rightElements,
  className = "",
}) => {
  return (
    <header
      className={`bg-secondary border-b border-gray-200 px-6 py-1 ${className}`}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left Section */}
        <div className="flex items-center space-x-4 flex-1">{<Logo />}</div>

        {/* Center Section */}
        <div className="flex items-center justify-center flex-1">
          {centerElements}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          {rightElements}
        </div>
      </div>
    </header>
  );
};

export { Header };
