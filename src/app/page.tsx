import { mockDbdBuilds } from "@/lib/mock/builds";
import { BuildPicker } from "@/components/build-picker/BuildPicker";

export default function Home() {
  return (
    <div className="max-w-[900px] w-full mx-auto px-4 py-8">
      <BuildPicker builds={mockDbdBuilds} />
    </div>
  );
}
