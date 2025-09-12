import useToast from "@/hooks/use-toast";

export default function useCopy() {
  const toast = useToast();
  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success({
        title: "Copied"
      });
    } catch (err) {
      toast.fail({
        title: "Copy failed"
      });
    }
  };
  return {
    onCopy
  };
}
