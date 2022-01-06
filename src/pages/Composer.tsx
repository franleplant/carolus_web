import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useContractV1, usePublishMint } from "dal/contractV1";
import Button from "components/Button";

export default function ComposerPage() {
  const contract = useContractV1();
  const { mutateAsync: publishMint } = usePublishMint();
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  async function onPublish(content: string) {
    if (!contract) {
      throw new Error("contract is undef");
    }

    try {
      await publishMint({ content });
      navigate("/");
    } catch (err) {
      console.error(err);
    }
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
        <Button type="submit" className="">
          Submit
        </Button>
      </form>
    </div>
  );
}
