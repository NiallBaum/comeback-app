import { getBuildsWithCache } from "@/lib/cache/builds";
import { poeAdapter } from "@/lib/adapters/poe";
import { BuildPicker } from "@/components/build-picker/BuildPicker";

export default async function Home() {
  const builds = await getBuildsWithCache(poeAdapter);

  return (
    <div className="max-w-[900px] w-full mx-auto px-4 py-8">
      <BuildPicker builds={builds} />
    </div>
  );
}
