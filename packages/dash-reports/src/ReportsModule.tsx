import { Box, Button, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ReportsIndex } from './ReportsIndex';
import { ReportPage } from './ReportPage';
import type { TranslateFn } from './core/types';

export interface ReportsModuleProps {
  translate: TranslateFn;
  /** Base path this module is mounted at, e.g. '/reports'. */
  basePath: string;
}

/**
 * The whole reports module behind a single route.
 *
 * One resource, not one per report: the set of reports is decided by the
 * BACKEND registry, so hardcoding a resource per report in the frontend would
 * mean a frontend change (and a redeploy) every time a domain registers one —
 * exactly the coupling the spec-driven design exists to remove. A domain that
 * registers a sixth report gets it here with no frontend change at all.
 */
export function ReportsModule({ translate, basePath }: ReportsModuleProps) {
  const { reportKey } = useParams();
  const navigate = useNavigate();

  if (!reportKey) {
    return <ReportsIndex translate={translate} onOpen={(key) => navigate(`${basePath}/${key}`)} />;
  }

  return (
    <Box>
      <Stack direction="row" sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
        <Button size="small" onClick={() => navigate(basePath)}>
          ← {translate('dash_reports.back_to_list', { _: 'All reports' })}
        </Button>
      </Stack>
      <ReportPage reportKey={reportKey} translate={translate} />
    </Box>
  );
}

export default ReportsModule;
