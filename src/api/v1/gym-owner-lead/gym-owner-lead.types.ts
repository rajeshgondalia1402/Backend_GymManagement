export interface GymOwnerLeadSendOtpInput {
  email: string;
}

export interface GymOwnerLeadVerifyOtpInput {
  email: string;
  otpCode: string;
}

export interface GymOwnerLeadRegisterInput {
  email: string;
  name: string;
  gymName: string;
  mobile: string;
  gender: string;
}

export interface GymOwnerLeadCheckMobileInput {
  mobile: string;
}
