import { ContestCalendar } from '@/components/contests/ContestCalendar';
import { AppShell } from '@/components/layout/AppShell';

export const metadata = {
  title: 'Contest Calendar | CP Arena',
  description: 'Track upcoming competitive programming contests from Codeforces and LeetCode.',
};

export default function DashboardPage() {
  return (
    <AppShell>
      <ContestCalendar />
    </AppShell>
  );
}
