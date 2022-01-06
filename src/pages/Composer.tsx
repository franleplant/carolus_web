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
      <p>
        It is a long established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution of
        letters, as opposed to using 'Content here, content here', making it
        look like readable English. Many desktop publishing packages and web
        page editors now use Lorem Ipsum as their default model text, and a
        search for 'lorem ipsum' will uncover many web sites still in their
        infancy. Various versions have evolved over the years, sometimes by
        accident, sometimes on purpose (injected humour and the like).
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
