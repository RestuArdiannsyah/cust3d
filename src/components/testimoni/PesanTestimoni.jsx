export const PesanTestimoni = ({ initial, name, message }) => {
  return (
    <div className="min-w-[300px] max-w-[320px] mx-4 border border-white/10 p-5 rounded-lg hover:border-white/30 hover:bg-white/10 transition duration-300">
      <div className="flex items-center gap-4">
        <div className="py-2 px-4 rounded-full font-extrabold text-lg bg-blue-600">
          {initial}
        </div>
        <h1 className="font-medium">{name}</h1>
      </div>
      <div className="mt-4 opacity-80 line-clamp-2">{message}</div>
    </div>
  );
};
