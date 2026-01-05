import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { type FinancialData } from "@/types/cashflow";

const getDefaultFinancialData = (): FinancialData => ({
  currentAssets: {
    prev: {
      cash: 0,
      receivables: 0,
      inventory: 0,
      securities: 0,
      shortTermLoans: 0,
      deferredTaxAssets: 0,
      otherCurrentAssets: 0,
    },
    current: {
      cash: 0,
      receivables: 0,
      inventory: 0,
      securities: 0,
      shortTermLoans: 0,
      deferredTaxAssets: 0,
      otherCurrentAssets: 0,
    },
  },
  fixedAssets: {
    prev: {
      tangibleAssets: 0,
      intangibleAssets: 0,
      investmentSecurities: 0,
      longTermLoans: 0,
      deferredTaxAssets: 0,
      otherFixedAssets: 0,
    },
    current: {
      tangibleAssets: 0,
      intangibleAssets: 0,
      investmentSecurities: 0,
      longTermLoans: 0,
      deferredTaxAssets: 0,
      otherFixedAssets: 0,
    },
  },
  deferredAssets: {
    prev: { deferredAssets: 0 },
    current: { deferredAssets: 0 },
  },
  currentLiabilities: {
    prev: {
      accountsPayable: 0,
      shortTermBorrowings: 0,
      incomeTaxPayable: 0,
      deferredTaxLiabilities: 0,
      bonusReserve: 0,
      retirementBenefits: 0,
      otherCurrentLiabilities: 0,
    },
    current: {
      accountsPayable: 0,
      shortTermBorrowings: 0,
      incomeTaxPayable: 0,
      deferredTaxLiabilities: 0,
      bonusReserve: 0,
      retirementBenefits: 0,
      otherCurrentLiabilities: 0,
    },
  },
  fixedLiabilities: {
    prev: {
      longTermBorrowings: 0,
      deferredTaxLiabilities: 0,
      retirementBenefits: 0,
      otherFixedLiabilities: 0,
    },
    current: {
      longTermBorrowings: 0,
      deferredTaxLiabilities: 0,
      retirementBenefits: 0,
      otherFixedLiabilities: 0,
    },
  },
  equity: {
    prev: {
      capitalStock: 0,
      retainedEarnings: 0,
      treasuryStock: 0,
    },
    current: {
      capitalStock: 0,
      retainedEarnings: 0,
      treasuryStock: 0,
    },
  },
  incomeStatement: {
    pretaxIncome: 0,
    netIncome: 0,
    depreciation: 0,
    interestIncome: 0,
    interestExpense: 0,
    securitiesGain: 0,
    securitiesLoss: 0,
    fixedAssetGain: 0,
    fixedAssetLoss: 0,
  },
  appropriation: {
    dividends: 0,
    executiveBonuses: 0,
  },
});

export const useCashFlow = (userId?: string) => {
  const [financialData, setFinancialData] = useState<FinancialData>(
    getDefaultFinancialData()
  );

  const [metadata, setMetadata] = useState<{
    id?: string;
    companyName?: string;
    fiscalYear?: string;
  }>({});

  const [clearKey, setClearKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // データ読み込み
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        // ログアウト時にデータをクリア
        setFinancialData(getDefaultFinancialData());
        setMetadata({});
        setClearKey((prev) => prev + 1); // NumericInputを強制的に再マウント
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data: statements, error: fetchError } = await supabase
          .from("cash_flow_statements")
          .select("*")
          .eq("user_id", userId);

        if (fetchError) throw fetchError;

        if (statements && statements.length > 0) {
          const statement = statements[0];
          setFinancialData(statement.financial_data);
          setMetadata({
            id: statement.id,
            companyName: statement.company_name,
            fiscalYear: statement.fiscal_year,
          });
        } else {
          const { data: newStatement, error: insertError } = await supabase
            .from("cash_flow_statements")
            .insert({
              user_id: userId,
              company_name: "",
              fiscal_year: "",
              financial_data: getDefaultFinancialData(),
            })
            .select()
            .single();

          if (insertError) throw insertError;

          setFinancialData(newStatement.financial_data);
          setMetadata({
            id: newStatement.id,
            companyName: newStatement.company_name,
            fiscalYear: newStatement.fiscal_year,
          });
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // データ保存
  const saveData = useCallback(
    async (
      updatedData: FinancialData,
      companyName?: string,
      fiscalYear?: string
    ) => {
      try {
        setIsSaving(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const recordId = metadata.id;
        if (!recordId) throw new Error("Record ID not found");

        const { error: updateError } = await supabase
          .from("cash_flow_statements")
          .update({
            financial_data: updatedData,
            ...(companyName && { company_name: companyName }),
            ...(fiscalYear && { fiscal_year: fiscalYear }),
            updated_at: new Date().toISOString(),
          })
          .eq("id", recordId);

        if (updateError) throw updateError;

        // setFinancialData(updatedData);
        // if (companyName) setMetadata((prev) => ({ ...prev, companyName }));
        // if (fiscalYear) setMetadata((prev) => ({ ...prev, fiscalYear }));

        return recordId;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [metadata.id]
  );

  // 自動保存（デバウンス付き）
  useEffect(() => {
    if (loading) return;
    if (!userId || !metadata.id) return;

    const timeoutId = setTimeout(() => {
      saveData(financialData).catch((err) => {
        console.error("Auto-save error:", err);
      });
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialData, loading, userId, metadata.id]);

  // 各セクションの更新関数
  const updateCurrentAssets = useCallback(
    (
      updater: (
        prev: FinancialData["currentAssets"]
      ) => FinancialData["currentAssets"]
    ) => {
      setFinancialData((prev) => ({
        ...prev,
        currentAssets: updater(prev.currentAssets),
      }));
    },
    []
  );

  const updateFixedAssets = useCallback(
    (
      updater: (
        prev: FinancialData["fixedAssets"]
      ) => FinancialData["fixedAssets"]
    ) => {
      setFinancialData((prev) => ({
        ...prev,
        fixedAssets: updater(prev.fixedAssets),
      }));
    },
    []
  );

  const updateDeferredAssets = useCallback(
    (
      updater: (
        prev: FinancialData["deferredAssets"]
      ) => FinancialData["deferredAssets"]
    ) => {
      setFinancialData((prev) => ({
        ...prev,
        deferredAssets: updater(prev.deferredAssets),
      }));
    },
    []
  );

  const updateCurrentLiabilities = useCallback(
    (
      updater: (
        prev: FinancialData["currentLiabilities"]
      ) => FinancialData["currentLiabilities"]
    ) => {
      setFinancialData((prev) => ({
        ...prev,
        currentLiabilities: updater(prev.currentLiabilities),
      }));
    },
    []
  );

  const updateFixedLiabilities = useCallback(
    (
      updater: (
        prev: FinancialData["fixedLiabilities"]
      ) => FinancialData["fixedLiabilities"]
    ) => {
      setFinancialData((prev) => ({
        ...prev,
        fixedLiabilities: updater(prev.fixedLiabilities),
      }));
    },
    []
  );

  const updateEquity = useCallback(
    (updater: (prev: FinancialData["equity"]) => FinancialData["equity"]) => {
      setFinancialData((prev) => ({
        ...prev,
        equity: updater(prev.equity),
      }));
    },
    []
  );

  const updateIncomeStatement = useCallback(
    (
      updater: (
        prev: FinancialData["incomeStatement"]
      ) => FinancialData["incomeStatement"]
    ) => {
      setFinancialData((prev) => ({
        ...prev,
        incomeStatement: updater(prev.incomeStatement),
      }));
    },
    []
  );

  const updateAppropriation = useCallback(
    (
      updater: (
        prev: FinancialData["appropriation"]
      ) => FinancialData["appropriation"]
    ) => {
      setFinancialData((prev) => ({
        ...prev,
        appropriation: updater(prev.appropriation),
      }));
    },
    []
  );

  // 入力項目のクリア
  const clearAllData = useCallback(async () => {
    const defaultData = getDefaultFinancialData();

    setFinancialData(defaultData);
    setClearKey((prev) => prev + 1);

    if (userId && metadata.id) {
      try {
        await saveData(defaultData);
      } catch (err) {
        console.error("Failed to clear data on server:", err);
      }
    }
  }, [userId, metadata.id, saveData]);

  return {
    // 各セクションのデータ
    currentAssets: financialData.currentAssets,
    fixedAssets: financialData.fixedAssets,
    deferredAssets: financialData.deferredAssets,
    currentLiabilities: financialData.currentLiabilities,
    fixedLiabilities: financialData.fixedLiabilities,
    equity: financialData.equity,
    incomeStatement: financialData.incomeStatement,
    appropriation: financialData.appropriation,

    // 更新関数
    updateCurrentAssets,
    updateFixedAssets,
    updateDeferredAssets,
    updateCurrentLiabilities,
    updateFixedLiabilities,
    updateEquity,
    updateIncomeStatement,
    updateAppropriation,

    // メタデータと状態
    metadata,
    isSaving,
    loading,
    error,
    saveData,

    // 入力項目クリア
    clearKey,
    clearAllData,
  };
};
