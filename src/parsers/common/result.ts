export interface SuccessResult<TOutput> {
  success: true;
  value: TOutput;
}

export interface ErrorResult {
  success: false;
  error: string;
}

export type Result<TOutput> = SuccessResult<TOutput> | ErrorResult;
