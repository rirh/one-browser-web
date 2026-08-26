import {
  useLocation,
  useNavigate,
  useSearchParams as useReactRouterSearchParams,
} from 'react-router-dom';

export function usePathname() {
  return useLocation().pathname;
}

export function useRouter() {
  const navigate = useNavigate();

  return {
    push: (to: string) => navigate(to),
    replace: (to: string) => navigate(to, { replace: true }),
    back: () => navigate(-1),
  };
}

export function useSearchParams() {
  const [searchParams] = useReactRouterSearchParams();
  return searchParams;
}
