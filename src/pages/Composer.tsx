import { ethers } from "ethers";
import { useContractV1, useNewsForceUpdate } from "dal/contractV1";
import Composer from "components/Composer";

export default function ComposerPage() {
  const contract = useContractV1();

  const forceUpdateNews = useNewsForceUpdate();
  async function onPublish(content: string) {
    if (!contract) {
      throw new Error("contract is undef");
    }

    try {
      const tx = await contract.publishMint(content, {
        value: ethers.constants.WeiPerEther.div(2),
      });
      const receipt = await tx.wait();
      if (!receipt.status) {
        throw new Error();
      }
      forceUpdateNews();
    } catch (err) {
      console.error(err);
    }
  }

  return <Composer onPublish={onPublish} />;
}
