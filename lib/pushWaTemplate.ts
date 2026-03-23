import axios from "axios";

interface dataRep {
    replacementText: string
}

export const pushWhatsapp = async (hpTgt: string, template: string, dataRep: dataRep[], headers: string[]) => {
    let data = {
        to: hpTgt,
        templateNameSpace: "aed686e8_5a23_4897_91e0_ce5c9495fc99",
        templateName: template,
        header: headers,
        body: dataRep,
      };

    try {
        const resp = await axios.post(
            `https://int-popiceuyu.redbox.id/api/qiscus/template`,
            data,
            {
            headers: {
                ContentType: "application/json",
            },
            }
        ).then(res => res.data)
        return resp
    } catch (err) {
        return err
    }
}