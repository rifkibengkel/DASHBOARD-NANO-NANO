import { NextApiRequest, GetServerSideProps } from "next";
import { getLoginSession } from "@/lib/auth";
import { pageCheck } from "@/lib/serverHelper";

export function withAuth(propz: GetServerSideProps): GetServerSideProps {
  return async (ctx) => {
    const session = await getLoginSession(ctx.req as NextApiRequest);
    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const trueRole = await pageCheck(
      session.username,
      [
        "/entries/entry",
        "/entriesApprove/entry",
        "/winners/entry",
        "/pointredeem/physical/entry",
        '/livechat/agents/detail'
      ].includes(ctx.resolvedUrl.split("?")[0])
        ? "/entries"
        : ctx.resolvedUrl.split("?")[0]
    );

    if (trueRole.length < 1) {
      return {
        redirect: {
          destination: "/403",
          permanent: false,
        },
      };
    }

    const propzData: any = await propz(ctx);

    if (!("props" in propzData)) {
      throw new Error("invalid getSSP result");
    }

    const isAdmin: boolean = [8, 15].includes(trueRole[0]?.role);

    return {
      props: {
        ...propzData.props,
        access: {
          m_insert: trueRole[0]?.m_insert,
          m_update: trueRole[0]?.m_update,
          m_delete: trueRole[0]?.m_delete,
          m_view: trueRole[0]?.m_view,
        },
        master: {
          ...propzData.props.master,
          isAdmin: isAdmin,
        },
      },
    };
  };
}
