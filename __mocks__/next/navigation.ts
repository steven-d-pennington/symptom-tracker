export const pushMock = jest.fn();

export const useRouter = () => ({ push: pushMock });
export const usePathname = jest.fn();
export const useSearchParams = jest.fn();
export const useParams = jest.fn();
