import { useContractV1, usePublishMint } from "dal/contractV1";
import Composer from "components/Composer";

export default function ComposerPage() {
  const contract = useContractV1();

  const { mutateAsync: publishMint } = usePublishMint();

  async function onPublish(content: string) {
    if (!contract) {
      throw new Error("contract is undef");
    }

    try {
      await publishMint({ content });
    } catch (err) {
      console.error(err);
    }
  }

  return <Composer onPublish={onPublish} />;
}
