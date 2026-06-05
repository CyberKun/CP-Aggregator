'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ProblemFilterPanel } from '@/components/practice/ProblemFilterPanel';
import { ProblemTable } from '@/components/practice/ProblemTable';
import { useProblems } from '@/hooks/useProblems';

export default function PracticePage() {
  const { problems, loading, filters, updateFilters, page, totalPages, nextPage, prevPage, solvedProblemIds } = useProblems();

  return (
    <AppShell>
      <div className="flex flex-col gap-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Practice</h1>
          <p className="text-gray-400">Discover and filter problems from your favorite platforms.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <ProblemFilterPanel filters={filters} updateFilters={updateFilters} />
          <div className="flex-1 w-full min-w-0">
            <ProblemTable
              problems={problems}
              loading={loading}
              page={page}
              totalPages={totalPages}
              onNextPage={nextPage}
              onPrevPage={prevPage}
              solvedProblemIds={solvedProblemIds}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
