// interface PageHeaderProps {
//   title: string;
//   description?: string;
//   children?: React.ReactNode;
// }

// const PageHeader = ({ title, description, children }: PageHeaderProps) => (
//   <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//     <div>
//       <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
//       {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
//     </div>
//     {children && <div className="flex items-center gap-2">{children}</div>}
//   </div>
// );

// export default PageHeader;


import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">{children}</div>
      )}
    </div>
  );
};

export default PageHeader;