import { twMerge } from "tailwind-merge";

export default function Button({ children, className, ...props }) {
  const baseStyles =
    "inline-block cursor-pointer items-center justify-center rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 hover:[transform:translateY(-.335rem)] hover:shadow-xl text-slate-200";

  return (
    <button className={twMerge(baseStyles, className)} {...props}>
      {children}
    </button>
  );
}
