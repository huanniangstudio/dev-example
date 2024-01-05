import axios, { AxiosInstance, AxiosResponse } from "axios";

interface CreatePutOnPrepareResponse {
  auctionId: string;
  psbt: string;
  signIndexes: number[];
}

export interface CreateBidPrepareResponse {
  serverFee: number;
  serverReal: number;
  serverFeeRate: number;
  txSize: number;
  feeRate: number;
  nftValue: number;
  discounts: any[];
  inscriptionCount: number;
  availableBalance: number;
  allBalance: number;
}

class RequestError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public response?: AxiosResponse
  ) {
    super((response && response.config ? response.config.url : "") + message);
  }

  isApiException = true;
}

export class OpenApi {
  private axios: AxiosInstance;

  constructor(params: { baseUrl: string; apiKey: string }) {
    this.axios = axios.create({
      baseURL: params.baseUrl,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.apiKey}`,
      },
    });

    this.axios.interceptors.response.use(
      (async (
        response: AxiosResponse<{
          code: number;
          msg: string;
          data: any;
        }>
      ) => {
        const res = response.data;
        if (res.code != 0) {
          throw new RequestError(res.msg);
        }
        return res.data;
      }) as any,
      (error) => {
        if (error.response) {
          return Promise.reject(
            new RequestError(
              error.response.data,
              error.response.status,
              error.response
            )
          );
        }

        if (error.isAxiosError) {
          return Promise.reject(new RequestError("noInternetConnection"));
        }
        return Promise.reject(error);
      }
    );
  }

  async createPutOnPrepare({
    type,
    inscriptionId,
    initPrice,
    unitPrice,
    pubkey,
    marketType,
  }: {
    type: "brc20" | "collection" | "domain";
    inscriptionId: string;
    initPrice: string;
    unitPrice: string;
    pubkey: string;
    marketType: "fixedPrice";
  }) {
    const response = await this.axios.post<null, CreatePutOnPrepareResponse>(
      `/v3/market/${type}/auction/create_put_on`,
      {
        inscriptionId,
        initPrice,
        unitPrice,
        pubkey,
        marketType,
      }
    );
    return response;
  }

  async confirmPutOn({
    type,
    auctionId,
    psbt,
    fromBase64,
  }: {
    type: "brc20" | "collection" | "domain";
    auctionId: string;
    psbt: string;
    fromBase64: boolean;
  }) {
    const response = await this.axios.post<null, {}>(
      `/v3/market/${type}/auction/confirm_put_on`,
      {
        auctionId,
        psbt,
        fromBase64,
      }
    );
    return response;
  }

  async createBidPrepare({
    type,
    auctionId,
    bidPrice,
    address,
    pubkey,
  }: {
    type: "brc20" | "collection" | "domain";
    auctionId: string;
    bidPrice: number;
    address: string;
    pubkey: string;
  }) {
    const response = await this.axios.post<null, CreateBidPrepareResponse>(
      `/v3/market/${type}/auction/create_bid_prepare`,
      {
        auctionId,
        bidPrice,
        address,
        pubkey,
      }
    );
    return response;
  }

  async createBid({
    type,
    address,
    auctionId,
    bidPrice,
    feeRate,
    pubkey,
  }: {
    type: "brc20" | "collection" | "domain";
    address: string;
    auctionId: string;
    bidPrice: number;
    feeRate: number;
    pubkey: string;
  }) {
    const response = await this.axios.post<
      null,
      {
        bidId: string;
        psbtBid: string;
        serverFee: number;
        networkFee: number;
        feeRate: number;
        nftValue: number;
        bidSignIndexes: number[];
      }
    >(`/v3/market/${type}/auction/create_bid`, {
      auctionId,
      feeRate,
      address,
      pubkey,
      bidPrice,
    });
    return response;
  }

  async confirmBid({
    type,
    bidId,
    psbtBid,
    psbtBid2,
    auctionId,
    psbtSettle,
    fromBase64,
  }: {
    type: "brc20" | "collection" | "domain";
    auctionId: string;
    fromBase64: boolean;
    bidId: string;
    psbtBid: string;
    psbtBid2: string;
    psbtSettle: string;
  }) {
    const response = await this.axios.post<null, {}>(
      `/v3/market/${type}/auction/confirm_bid`,
      {
        auctionId,
        bidId,
        psbtBid,
        psbtBid2,
        psbtSettle,
        fromBase64,
      }
    );
    return response;
  }
}
