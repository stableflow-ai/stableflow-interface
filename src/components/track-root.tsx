import { useTrack } from "@/hooks/use-track";

const TrackRoot = () => {
  useTrack({ isRoot: true });

  return null;
};

export default TrackRoot;
