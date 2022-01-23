import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { usePublishMint } from "dal/contractV1";
import Button from "components/Button";
import { useWeb3Session } from "hooks/web3";
import { useContractV1 } from "hooks/contract";

const TOKEN_MINT_PRICE = process.env.REACT_APP_TOKEN_MINT_PRICE;
if (!TOKEN_MINT_PRICE) {
  throw new Error(`missing TOKEN_MINT_PRICE`);
}

const TOKEN_MINT_PRICE_N = Number(TOKEN_MINT_PRICE);

let VALUE_MINT: ethers.BigNumberish;
if (TOKEN_MINT_PRICE_N < 1) {
  VALUE_MINT = ethers.constants.WeiPerEther.div(1 / TOKEN_MINT_PRICE_N);
} else {
  VALUE_MINT = ethers.constants.WeiPerEther.mul(TOKEN_MINT_PRICE_N);
}

export default function ComposerPage() {
  const [publishing, setPublishing] = useState(false);
  const { active, account } = useWeb3Session();
  const contract = useContractV1();
  const { mutateAsync: publishMint } = usePublishMint();
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  async function onPublish(content: string) {
    if (!contract) {
      throw new Error("contract is undef");
    }

    setPublishing(true);

    try {
      await publishMint({ content, value: VALUE_MINT });
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  }

  if (!active || !account) {
    return <div>Please Login</div>;
  }

  return (
    <div className="flex-1 flex flex-col md:w-[60rem] p-4 mx-auto mt-4 gap-4">
      <h1 className="text-center">Compose</h1>
      <p>Publish your own uncensorable news through the magic of blockchain.</p>
      <p>
        The content is plain text, the first non-empty non-white space line will
        be interpreted as the title and there is no size limit but you would
        need to pay for it.
      </p>

      <p>Price: {ethers.utils.formatEther(VALUE_MINT)} Matic</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onPublish(content);
        }}
        className="flex flex-col gap-4"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="w-full p-4 font-mono rounded-none rounded drop-shadow-md bg-paper_bg outline-1 outline-paper_fg"
        />
        <Button type="submit" className="" disabled={publishing}>
          {publishing ? "Submiting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
