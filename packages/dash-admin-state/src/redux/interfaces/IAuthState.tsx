export type IAuthState<U, A> = {
	authenticated: boolean;
	user: U;
	auth: A;
};

export default IAuthState;
