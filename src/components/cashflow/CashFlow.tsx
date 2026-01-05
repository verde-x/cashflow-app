import { useCashFlow } from "@/hooks/useCashFlow";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "../ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NumericInput } from "@/components/ui/numeric-input";
import { normalizeZero, getValueColorClass } from "@/utils/formatters";
import { RotateCcw } from "lucide-react";

export const CashFlowInput = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const {
    currentAssets,
    fixedAssets,
    deferredAssets,
    currentLiabilities,
    fixedLiabilities,
    equity,
    incomeStatement,
    appropriation,
    updateCurrentAssets,
    updateFixedAssets,
    updateDeferredAssets,
    updateCurrentLiabilities,
    updateFixedLiabilities,
    updateEquity,
    updateIncomeStatement,
    updateAppropriation,
    loading,
    error,
    clearAllData,
    clearKey,
  } = useCashFlow(userId);

  // 流動資産計
  const totalCurrentAssets = {
    prev:
      (currentAssets.prev.cash || 0) +
      (currentAssets.prev.receivables || 0) +
      (currentAssets.prev.inventory || 0) +
      (currentAssets.prev.securities || 0) +
      (currentAssets.prev.shortTermLoans || 0) +
      (currentAssets.prev.deferredTaxAssets || 0) +
      (currentAssets.prev.otherCurrentAssets || 0),
    current:
      (currentAssets.current.cash || 0) +
      (currentAssets.current.receivables || 0) +
      (currentAssets.current.inventory || 0) +
      (currentAssets.current.securities || 0) +
      (currentAssets.current.shortTermLoans || 0) +
      (currentAssets.current.deferredTaxAssets || 0) +
      (currentAssets.current.otherCurrentAssets || 0),
  };

  // 固定資産計
  const totalFixedAssets = {
    prev:
      (fixedAssets.prev.tangibleAssets || 0) +
      (fixedAssets.prev.intangibleAssets || 0) +
      (fixedAssets.prev.investmentSecurities || 0) +
      (fixedAssets.prev.longTermLoans || 0) +
      (fixedAssets.prev.otherFixedAssets || 0) +
      (fixedAssets.prev.deferredTaxAssets || 0),
    current:
      (fixedAssets.current.tangibleAssets || 0) +
      (fixedAssets.current.intangibleAssets || 0) +
      (fixedAssets.current.investmentSecurities || 0) +
      (fixedAssets.current.longTermLoans || 0) +
      (fixedAssets.current.otherFixedAssets || 0) +
      (fixedAssets.current.deferredTaxAssets || 0),
  };

  // 資産合計
  const totalAssetsPrev =
    totalCurrentAssets.prev +
    totalFixedAssets.prev +
    (deferredAssets.prev.deferredAssets || 0);

  const totalAssetsCurrent =
    totalCurrentAssets.current +
    totalFixedAssets.current +
    (deferredAssets.current.deferredAssets || 0);

  // 流動負債計
  const totalCurrentLiabilities = {
    prev:
      (currentLiabilities.prev.accountsPayable || 0) +
      (currentLiabilities.prev.shortTermBorrowings || 0) +
      (currentLiabilities.prev.incomeTaxPayable || 0) +
      (currentLiabilities.prev.deferredTaxLiabilities || 0) +
      (currentLiabilities.prev.bonusReserve || 0) +
      (currentLiabilities.prev.retirementBenefits || 0) +
      (currentLiabilities.prev.otherCurrentLiabilities || 0),

    current:
      (currentLiabilities.current.accountsPayable || 0) +
      (currentLiabilities.current.shortTermBorrowings || 0) +
      (currentLiabilities.current.incomeTaxPayable || 0) +
      (currentLiabilities.current.deferredTaxLiabilities || 0) +
      (currentLiabilities.current.bonusReserve || 0) +
      (currentLiabilities.current.retirementBenefits || 0) +
      (currentLiabilities.current.otherCurrentLiabilities || 0),
  };

  // 固定負債計
  const totalFixedLiabilitiesPrev =
    (fixedLiabilities.prev.longTermBorrowings || 0) +
    (fixedLiabilities.prev.deferredTaxLiabilities || 0) +
    (fixedLiabilities.prev.retirementBenefits || 0) +
    (fixedLiabilities.prev.otherFixedLiabilities || 0);

  const totalFixedLiabilitiesCurrent =
    (fixedLiabilities.current.longTermBorrowings || 0) +
    (fixedLiabilities.current.deferredTaxLiabilities || 0) +
    (fixedLiabilities.current.retirementBenefits || 0) +
    (fixedLiabilities.current.otherFixedLiabilities || 0);

  // 負債合計
  const totalLiabilities = {
    prev: totalCurrentLiabilities.prev + totalFixedLiabilitiesPrev,
    current: totalCurrentLiabilities.current + totalFixedLiabilitiesCurrent,
  };

  // 資本合計
  const totalEquity = {
    prev:
      (equity.prev.capitalStock || 0) +
      (equity.prev.retainedEarnings || 0) +
      (equity.prev.treasuryStock || 0),
    current:
      (equity.current.capitalStock || 0) +
      (equity.current.retainedEarnings || 0) +
      (equity.current.treasuryStock || 0),
  };

  // 負債･資本合計
  const totalLiabilitiesAndEquity = {
    prev: totalLiabilities.prev + totalEquity.prev,
    current: totalLiabilities.current + totalEquity.current,
  };

  // バランスチェック
  const isBalanced = {
    prev: totalAssetsPrev === totalLiabilitiesAndEquity.prev,
    current: totalAssetsCurrent === totalLiabilitiesAndEquity.current,
  };

  // キャッシュフロー計算書

  // 退職給付引当金
  const retirementBenefitsChange = normalizeZero(
    currentLiabilities.current.retirementBenefits -
      currentLiabilities.prev.retirementBenefits +
      (fixedLiabilities.current.retirementBenefits -
        fixedLiabilities.prev.retirementBenefits)
  );

  // 賞与引当金
  const bonusReserveChange = normalizeZero(
    currentLiabilities.current.bonusReserve -
      currentLiabilities.prev.bonusReserve
  );

  // 受取利息・受取配当金
  const interestIncome = normalizeZero(-incomeStatement.interestIncome);

  // 有価証券売却損益･評価損
  const securitiesGainLoss = normalizeZero(
    incomeStatement.securitiesLoss - incomeStatement.securitiesGain
  );

  // 固定資産売却損益･廃棄損
  const fixedAssetGainLoss = normalizeZero(
    incomeStatement.fixedAssetLoss - incomeStatement.fixedAssetGain
  );

  // 繰越ヘッジ損益の増減
  const treasuryStockChange = normalizeZero(
    equity.current.treasuryStock - equity.prev.treasuryStock
  );

  // 売上債権減少（△増加）
  const receivablesChange = normalizeZero(
    -(currentAssets.current.receivables - currentAssets.prev.receivables)
  );

  // 棚卸資産減少（△増加）
  const inventoryChange = normalizeZero(
    -(currentAssets.current.inventory - currentAssets.prev.inventory)
  );

  // その他流動資産減少（△増加）
  const otherCurrentAssetsChange = normalizeZero(
    -(
      currentAssets.current.otherCurrentAssets -
      currentAssets.prev.otherCurrentAssets
    )
  );

  // 繰延資産減少（△増加）
  const deferredAssetsChange = normalizeZero(
    -(
      deferredAssets.current.deferredAssets - deferredAssets.prev.deferredAssets
    )
  );

  // 仕入債務増加（△減少）
  const accountsPayableChange = normalizeZero(
    currentLiabilities.current.accountsPayable -
      currentLiabilities.prev.accountsPayable
  );

  // その他流動負債増加（△減少）
  const otherCurrentLiabilitiesChange = normalizeZero(
    currentLiabilities.current.otherCurrentLiabilities -
      currentLiabilities.prev.otherCurrentLiabilities
  );

  // その他固定負債増加（△減少）
  const otherFixedLiabilitiesChange = normalizeZero(
    fixedLiabilities.current.otherFixedLiabilities -
      fixedLiabilities.prev.otherFixedLiabilities
  );

  // 役員賞与
  const executiveBonuses = normalizeZero(-appropriation.executiveBonuses);

  // 営業活動CF 小計1
  const operatingSubtotal1 =
    incomeStatement.pretaxIncome +
    incomeStatement.depreciation +
    retirementBenefitsChange +
    bonusReserveChange +
    interestIncome +
    incomeStatement.interestExpense +
    securitiesGainLoss +
    fixedAssetGainLoss +
    treasuryStockChange +
    receivablesChange +
    inventoryChange +
    otherCurrentAssetsChange +
    deferredAssetsChange +
    accountsPayableChange +
    otherCurrentLiabilitiesChange +
    otherFixedLiabilitiesChange +
    executiveBonuses;

  // 支払利息
  const interestExpense = normalizeZero(-incomeStatement.interestExpense);

  // 法人税等の支払額
  const incomeTaxesPaid = normalizeZero(
    incomeStatement.netIncome -
      incomeStatement.pretaxIncome -
      (currentAssets.current.deferredTaxAssets -
        currentAssets.prev.deferredTaxAssets) -
      (fixedAssets.current.deferredTaxAssets -
        fixedAssets.prev.deferredTaxAssets) +
      (currentLiabilities.current.deferredTaxLiabilities -
        currentLiabilities.prev.deferredTaxLiabilities) +
      (fixedLiabilities.current.deferredTaxLiabilities -
        fixedLiabilities.prev.deferredTaxLiabilities) +
      (currentLiabilities.current.incomeTaxPayable -
        currentLiabilities.prev.incomeTaxPayable)
  );

  // 営業活動CF 小計2
  const operatingSubtotal2 = normalizeZero(
    incomeStatement.interestIncome + interestExpense + incomeTaxesPaid
  );

  // 営業活動によるCF
  const totalOperatingCF = normalizeZero(
    operatingSubtotal1 + operatingSubtotal2
  );

  // 有形固定資産の減少（△増加）
  const tangibleAssetsChange = normalizeZero(
    -(fixedAssets.current.tangibleAssets - fixedAssets.prev.tangibleAssets) +
      incomeStatement.fixedAssetGain -
      incomeStatement.fixedAssetLoss -
      incomeStatement.depreciation
  );

  // 無形固定資産の減少（△増加）
  const intangibleAssetsChange = normalizeZero(
    -(fixedAssets.current.intangibleAssets - fixedAssets.prev.intangibleAssets)
  );

  // 有価証券の減少（△増加）
  const securitiesChange = normalizeZero(
    -(currentAssets.current.securities - currentAssets.prev.securities) -
      (fixedAssets.current.investmentSecurities -
        fixedAssets.prev.investmentSecurities) +
      incomeStatement.securitiesGain -
      incomeStatement.securitiesLoss
  );

  // 貸付金の減少（△増加）
  const loansChange = normalizeZero(
    -(
      currentAssets.current.shortTermLoans - currentAssets.prev.shortTermLoans
    ) -
      (fixedAssets.current.longTermLoans - fixedAssets.prev.longTermLoans)
  );

  // その他固定資産の減少（△増加）
  const otherFixedAssetsChange = normalizeZero(
    -(fixedAssets.current.otherFixedAssets - fixedAssets.prev.otherFixedAssets)
  );

  // 投資活動によるCF
  const totalInvestingCF = normalizeZero(
    tangibleAssetsChange +
      intangibleAssetsChange +
      securitiesChange +
      loansChange +
      otherFixedAssetsChange
  );

  // 短期借入金の増加（△減少）
  const shortTermBorrowingsChange = normalizeZero(
    currentLiabilities.current.shortTermBorrowings -
      currentLiabilities.prev.shortTermBorrowings
  );

  // 長期借入金･社債の増加（△減少）
  const longTermBorrowingsChange = normalizeZero(
    fixedLiabilities.current.longTermBorrowings -
      fixedLiabilities.prev.longTermBorrowings
  );

  // 増資
  const capitalIncrease = normalizeZero(
    equity.current.capitalStock - equity.prev.capitalStock
  );

  // 支払配当金
  const dividendsPaid = normalizeZero(-appropriation.dividends);

  // 財務活動によるCF
  const totalFinancingCF = normalizeZero(
    shortTermBorrowingsChange +
      longTermBorrowingsChange +
      capitalIncrease +
      dividendsPaid
  );

  // 現預金残高の増加（△減少）
  const cashIncrease = normalizeZero(
    currentAssets.current.cash - currentAssets.prev.cash
  );

  // CF合計チェック
  const isCashFlowBalanced =
    cashIncrease === totalOperatingCF + totalInvestingCF + totalFinancingCF;

  // クリア処理ハンドラー
  const handleClear = () => {
    if (window.confirm("全ての入力データをクリアします。よろしいですか?")) {
      clearAllData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row item-start md:items-center justify-between gap-2 md:gap-0 mb-3">
        <div className="ps-2">
          {/* {!user && (
            <p className="text-sm text-amber-600">
              【注意】ログインしていないため、データは保存されません
            </p>
          )} */}
        </div>
        <Button
          onClick={handleClear}
          variant="outline"
          className="text-xs hover:text-red-600 w-full md:w-auto"
        >
          <RotateCcw className="h-4 w-4" />
          入力クリア
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        <Card className="col-span-5 p-6 min-h-[800px] overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-bold text-lg border-b pb-2">
                【資借対照表】
              </h3>
              <h4 className="font-semibold mt-4 mb-0">流動資産</h4>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label className="text-sm"></Label>
                <div className="text-right me-2 text-sm font-medium">前期</div>
                <div className="text-right me-2 text-sm font-medium">当期</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">現預金</Label>
                <NumericInput
                  key={`prev-cash-${clearKey}`}
                  className="text-right"
                  value={currentAssets.prev.cash || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, cash: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-cash-${clearKey}`}
                  className="text-right"
                  value={currentAssets.current.cash || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      current: { ...prev.current, cash: value || 0 },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">売掛金＋受取手形</Label>
                <NumericInput
                  key={`prev-receivables-${clearKey}`}
                  className="text-right"
                  value={currentAssets.prev.receivables || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, receivables: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-receivables-${clearKey}`}
                  className="text-right"
                  value={currentAssets.current.receivables || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      current: { ...prev.current, receivables: value || 0 },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">棚卸資産</Label>
                <NumericInput
                  key={`prev-inventory-${clearKey}`}
                  className="text-right"
                  value={currentAssets.prev.inventory || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, inventory: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-inventory-${clearKey}`}
                  className="text-right"
                  value={currentAssets.current.inventory || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      current: { ...prev.current, inventory: value || 0 },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">有価証券</Label>
                <NumericInput
                  key={`prev-securities-${clearKey}`}
                  className="text-right"
                  value={currentAssets.prev.securities || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, securities: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-securities-${clearKey}`}
                  className="text-right"
                  value={currentAssets.current.securities || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      current: { ...prev.current, securities: value || 0 },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">短期貸付金</Label>
                <NumericInput
                  key={`prev-shortTermLoss-${clearKey}`}
                  className="text-right"
                  value={currentAssets.prev.shortTermLoans || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, shortTermLoans: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-shortTermLoss-${clearKey}`}
                  className="text-right"
                  value={currentAssets.current.shortTermLoans || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      current: { ...prev.current, shortTermLoans: value || 0 },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">繰延税金資産</Label>
                <NumericInput
                  key={`prev-deferredTaxAssets-${clearKey}`}
                  className="text-right"
                  value={currentAssets.prev.deferredTaxAssets || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, deferredTaxAssets: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-deferredTaxAssets-${clearKey}`}
                  className="text-right"
                  value={currentAssets.current.deferredTaxAssets || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        deferredTaxAssets: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">その他流動資産</Label>
                <NumericInput
                  key={`prev-otherCurrentAssets-${clearKey}`}
                  className="text-right"
                  value={currentAssets.prev.otherCurrentAssets || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, otherCurrentAssets: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-otherCurrentAssets-${clearKey}`}
                  className="text-right"
                  value={currentAssets.current.otherCurrentAssets || undefined}
                  onValueChange={(value) =>
                    updateCurrentAssets((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        otherCurrentAssets: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 font-semibold">
                <Label className="text-sm">流動資産計</Label>
                <div className="text-right py-2 px-3">
                  {totalCurrentAssets.prev.toLocaleString()}
                </div>
                <div className="text-right py-2 px-3">
                  {totalCurrentAssets.current.toLocaleString()}
                </div>
              </div>
              <hr className="mt-8" />
              <h4 className="font-semibold mt-8">固定資産</h4>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label className="text-sm"></Label>
                <div className="text-right me-2 text-sm font-medium">前期</div>
                <div className="text-right me-2 text-sm font-medium">当期</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">有形固定資産</Label>
                <NumericInput
                  key={`prev-tangibleAssets-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.prev.tangibleAssets || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, tangibleAssets: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-tangibleAssets-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.current.tangibleAssets || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        tangibleAssets: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">無形固定資産</Label>
                <NumericInput
                  key={`prev-intangibleAssets-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.prev.intangibleAssets || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, intangibleAssets: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-intangibleAssets-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.current.intangibleAssets || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        intangibleAssets: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">投資有価証券</Label>
                <NumericInput
                  key={`prev-investmentSecurities-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.prev.investmentSecurities || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, investmentSecurities: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-investmentSecurities-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.current.investmentSecurities || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        investmentSecurities: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">長期貸付金</Label>
                <NumericInput
                  key={`prev-longTermLoans-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.prev.longTermLoans || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, longTermLoans: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-longTermLoans-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.current.longTermLoans || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        longTermLoans: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">繰延税金資産</Label>
                <NumericInput
                  key={`prev-deferredTaxAssets-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.prev.deferredTaxAssets || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, deferredTaxAssets: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-deferredTaxAssets-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.current.deferredTaxAssets || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        deferredTaxAssets: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">その他固定資産</Label>
                <NumericInput
                  key={`prev-otherFixedAssets-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.prev.otherFixedAssets || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, otherFixedAssets: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-otherFixedAssets-${clearKey}`}
                  className="text-right"
                  value={fixedAssets.current.otherFixedAssets || undefined}
                  onValueChange={(value) =>
                    updateFixedAssets((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        otherFixedAssets: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 font-semibold">
                <Label className="text-sm">固定資産計</Label>
                <div className="text-right py-2 px-3">
                  {totalFixedAssets.prev.toLocaleString()}
                </div>
                <div className="text-right py-2 px-3">
                  {totalFixedAssets.current.toLocaleString()}
                </div>
              </div>
              <hr className="mt-8" />
              <h4 className="font-semibold mt-8">繰延資産</h4>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label className="text-sm"></Label>
                <div className="text-right me-2 text-sm font-medium">前期</div>
                <div className="text-right me-2 text-sm font-medium">当期</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">繰延資産</Label>
                <NumericInput
                  key={`prev-deferredAssets-${clearKey}`}
                  className="text-right"
                  value={deferredAssets.prev.deferredAssets || undefined}
                  onValueChange={(value) =>
                    updateDeferredAssets((prev) => ({
                      ...prev,
                      prev: { ...prev.prev, deferredAssets: value || 0 },
                    }))
                  }
                />
                <NumericInput
                  key={`current-deferredAssets-${clearKey}`}
                  className="text-right"
                  value={deferredAssets.current.deferredAssets || undefined}
                  onValueChange={(value) =>
                    updateDeferredAssets((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        deferredAssets: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 font-semibold">
                <Label className="text-sm">資産合計</Label>
                <div className="text-right py-2 px-3">
                  {totalAssetsPrev.toLocaleString()}
                </div>
                <div className="text-right py-2 px-3">
                  {totalAssetsCurrent.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <hr className="mt-8" />
              <h4 className="font-semibold mt-4 mb-0">流動負債</h4>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label className="text-sm"></Label>
                <div className="text-right me-2 text-sm font-medium">前期</div>
                <div className="text-right me-2 text-sm font-medium">当期</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">買掛金＋支払手形</Label>
                <NumericInput
                  key={`prev-accountsPayable-${clearKey}`}
                  className="text-right"
                  value={currentLiabilities.prev.accountsPayable || undefined}
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        accountsPayable: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-accountsPayable-${clearKey}`}
                  className="text-right"
                  value={
                    currentLiabilities.current.accountsPayable || undefined
                  }
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        accountsPayable: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">短期借入金</Label>
                <NumericInput
                  key={`prev-shortTermBorrowings-${clearKey}`}
                  className="text-right"
                  value={
                    currentLiabilities.prev.shortTermBorrowings || undefined
                  }
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        shortTermBorrowings: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-shortTermBorrowings-${clearKey}`}
                  className="text-right"
                  value={
                    currentLiabilities.current.shortTermBorrowings || undefined
                  }
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        shortTermBorrowings: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">未払法人税等</Label>
                <NumericInput
                  key={`prev-incomeTaxPayable-${clearKey}`}
                  className="text-right"
                  value={currentLiabilities.prev.incomeTaxPayable || undefined}
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        incomeTaxPayable: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-incomeTaxPayable-${clearKey}`}
                  className="text-right"
                  value={
                    currentLiabilities.current.incomeTaxPayable || undefined
                  }
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        incomeTaxPayable: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">繰延税金負債</Label>
                <NumericInput
                  key={`prev-deferredTaxLiabilities-${clearKey}`}
                  className="text-right"
                  value={
                    currentLiabilities.prev.deferredTaxLiabilities || undefined
                  }
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        deferredTaxLiabilities: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-deferredTaxLiabilities-${clearKey}`}
                  className="text-right"
                  value={
                    currentLiabilities.current.deferredTaxLiabilities ||
                    undefined
                  }
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        deferredTaxLiabilities: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">賞与引当金</Label>
                <NumericInput
                  key={`prev-bonusReserve-${clearKey}`}
                  className="text-right"
                  value={currentLiabilities.prev.bonusReserve || undefined}
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        bonusReserve: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-bonusReserve-${clearKey}`}
                  className="text-right"
                  value={currentLiabilities.current.bonusReserve || undefined}
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        bonusReserve: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">退職給付引当金</Label>
                <NumericInput
                  key={`prev-retirementBenefits1-${clearKey}`}
                  className="text-right"
                  value={
                    currentLiabilities.prev.retirementBenefits || undefined
                  }
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        retirementBenefits: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-retirementBenefits1-${clearKey}`}
                  className="text-right"
                  value={
                    currentLiabilities.current.retirementBenefits || undefined
                  }
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        retirementBenefits: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">その他流動負債</Label>
                <NumericInput
                  key={`prev-otherCurrentLiabilities-${clearKey}`}
                  className="text-right"
                  value={
                    currentLiabilities.prev.otherCurrentLiabilities || undefined
                  }
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        otherCurrentLiabilities: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-otherCurrentLiabilities-${clearKey}`}
                  className="text-right"
                  value={
                    currentLiabilities.current.otherCurrentLiabilities ||
                    undefined
                  }
                  onValueChange={(value) =>
                    updateCurrentLiabilities((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        otherCurrentLiabilities: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 font-semibold">
                <Label className="text-sm">流動負債計</Label>
                <div className="text-right py-2 px-3">
                  {totalCurrentLiabilities.prev.toLocaleString()}
                </div>
                <div className="text-right py-2 px-3">
                  {totalCurrentLiabilities.current.toLocaleString()}
                </div>
              </div>
              <hr className="mt-8" />
              <h4 className="font-semibold mt-4 mb-0">固定負債</h4>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label className="text-sm"></Label>
                <div className="text-right me-2 text-sm font-medium">前期</div>
                <div className="text-right me-2 text-sm font-medium">当期</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">長期借入金･社債</Label>
                <NumericInput
                  key={`prev-longTermBorrowings-${clearKey}`}
                  className="text-right"
                  value={fixedLiabilities.prev.longTermBorrowings || undefined}
                  onValueChange={(value) =>
                    updateFixedLiabilities((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        longTermBorrowings: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-longTermBorrowings-${clearKey}`}
                  className="text-right"
                  value={
                    fixedLiabilities.current.longTermBorrowings || undefined
                  }
                  onValueChange={(value) =>
                    updateFixedLiabilities((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        longTermBorrowings: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">繰延税金負債</Label>
                <NumericInput
                  key={`prev-deferredTaxLiabilities2-${clearKey}`}
                  className="text-right"
                  value={
                    fixedLiabilities.prev.deferredTaxLiabilities || undefined
                  }
                  onValueChange={(value) =>
                    updateFixedLiabilities((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        deferredTaxLiabilities: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-deferredTaxLiabilities2-${clearKey}`}
                  className="text-right"
                  value={
                    fixedLiabilities.current.deferredTaxLiabilities || undefined
                  }
                  onValueChange={(value) =>
                    updateFixedLiabilities((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        deferredTaxLiabilities: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">退職給付引当金</Label>
                <NumericInput
                  key={`prev-retirementBenefits2-${clearKey}`}
                  className="text-right"
                  value={fixedLiabilities.prev.retirementBenefits || undefined}
                  onValueChange={(value) =>
                    updateFixedLiabilities((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        retirementBenefits: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-retirementBenefits2-${clearKey}`}
                  className="text-right"
                  value={
                    fixedLiabilities.current.retirementBenefits || undefined
                  }
                  onValueChange={(value) =>
                    updateFixedLiabilities((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        retirementBenefits: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">その他固定負債</Label>
                <NumericInput
                  key={`prev-otherFixedLiabilities-${clearKey}`}
                  className="text-right"
                  value={
                    fixedLiabilities.prev.otherFixedLiabilities || undefined
                  }
                  onValueChange={(value) =>
                    updateFixedLiabilities((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        otherFixedLiabilities: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-otherFixedLiabilities-${clearKey}`}
                  className="text-right"
                  value={
                    fixedLiabilities.current.otherFixedLiabilities || undefined
                  }
                  onValueChange={(value) =>
                    updateFixedLiabilities((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        otherFixedLiabilities: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 font-semibold">
                <Label className="text-sm">固定負債計</Label>
                <div className="text-right py-2 px-3">
                  {totalFixedLiabilitiesPrev.toLocaleString()}
                </div>
                <div className="text-right py-2 px-3">
                  {totalFixedLiabilitiesCurrent.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 font-semibold">
                <Label className="text-sm">負債合計</Label>
                <div className="text-right py-2 px-3">
                  {totalLiabilities.prev.toLocaleString()}
                </div>
                <div className="text-right py-2 px-3">
                  {totalLiabilities.current.toLocaleString()}
                </div>
              </div>

              <hr className="mt-8" />
              <h4 className="font-semibold mt-4 mb-0">資本</h4>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label className="text-sm"></Label>
                <div className="text-right me-2 text-sm font-medium">前期</div>
                <div className="text-right me-2 text-sm font-medium">当期</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">資本金･資本剰余金</Label>
                <NumericInput
                  key={`prev-capitalStock-${clearKey}`}
                  className="text-right"
                  value={equity.prev.capitalStock || undefined}
                  onValueChange={(value) =>
                    updateEquity((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        capitalStock: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-capitalStock-${clearKey}`}
                  className="text-right"
                  value={equity.current.capitalStock || undefined}
                  onValueChange={(value) =>
                    updateEquity((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        capitalStock: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">利益剰余金</Label>
                <NumericInput
                  key={`prev-retainedEarnings-${clearKey}`}
                  className="text-right"
                  value={equity.prev.retainedEarnings || undefined}
                  onValueChange={(value) =>
                    updateEquity((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        retainedEarnings: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-retainedEarnings-${clearKey}`}
                  className="text-right"
                  value={equity.current.retainedEarnings || undefined}
                  onValueChange={(value) =>
                    updateEquity((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        retainedEarnings: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="text-sm">繰延ヘッジ損益</Label>
                <NumericInput
                  key={`prev-treasuryStock-${clearKey}`}
                  className="text-right"
                  value={equity.prev.treasuryStock || undefined}
                  onValueChange={(value) =>
                    updateEquity((prev) => ({
                      ...prev,
                      prev: {
                        ...prev.prev,
                        treasuryStock: value || 0,
                      },
                    }))
                  }
                />
                <NumericInput
                  key={`current-treasuryStock-${clearKey}`}
                  className="text-right"
                  value={equity.current.treasuryStock || undefined}
                  onValueChange={(value) =>
                    updateEquity((prev) => ({
                      ...prev,
                      current: {
                        ...prev.current,
                        treasuryStock: value || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 font-semibold">
                <Label className="text-sm">資本合計</Label>
                <div className="text-right py-2 px-3">
                  {totalEquity.prev.toLocaleString()}
                </div>
                <div className="text-right py-2 px-3">
                  {totalEquity.current.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 font-semibold">
                <Label className="text-sm">負債･資本合計</Label>
                <div className="text-right py-2 px-3">
                  {totalLiabilitiesAndEquity.prev.toLocaleString()}
                </div>
                <div className="text-right py-2 px-3">
                  {totalLiabilitiesAndEquity.current.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0 pt-4 border-t">
                <Label className="text-sm">貸借バランスチェック</Label>
                <div
                  className={`text-sm text-right py-2 px-3 ${
                    isBalanced.prev ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isBalanced.prev ? "OK" : "NG"}
                </div>
                <div
                  className={`text-sm text-right py-2 px-3 ${
                    isBalanced.current ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isBalanced.current ? "OK" : "NG"}
                </div>
              </div>
              {(!isBalanced.prev || !isBalanced.current) && (
                <div className="grid grid-cols-3 gap-4 items-center ps-2 text-sm">
                  <Label className="text-sm">差異</Label>
                  <div className="text-sm text-right py-1 px-3">
                    {!isBalanced.prev &&
                      (
                        totalAssetsPrev - totalLiabilitiesAndEquity.prev
                      ).toLocaleString()}
                  </div>
                  <div className="text-sm text-right py-1 px-3">
                    {!isBalanced.current &&
                      (
                        totalAssetsCurrent - totalLiabilitiesAndEquity.current
                      ).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg border-b mt-12 pb-2">
                【損益計算書】
              </h3>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="col-span-2 text-sm">
                  (税引前) 当期純利益
                </Label>
                <NumericInput
                  key={`pretaxIncome-${clearKey}`}
                  className="col-start-3 text-right"
                  value={incomeStatement.pretaxIncome || undefined}
                  onValueChange={(value) =>
                    updateIncomeStatement((prev) => ({
                      ...prev,
                      pretaxIncome: value || 0,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="col-span-2 text-sm">
                  (税引後) 当期純利益
                </Label>
                <NumericInput
                  key={`netIncome-${clearKey}`}
                  className="col-start-3 text-right"
                  value={incomeStatement.netIncome || undefined}
                  onValueChange={(value) =>
                    updateIncomeStatement((prev) => ({
                      ...prev,
                      netIncome: value || 0,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="col-span-2 text-sm">
                  減価償却費 (販管費＋製造原価等)
                </Label>
                <NumericInput
                  key={`depreciation-${clearKey}`}
                  className="col-start-3 text-right"
                  value={incomeStatement.depreciation || undefined}
                  onValueChange={(value) =>
                    updateIncomeStatement((prev) => ({
                      ...prev,
                      depreciation: value || 0,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="col-span-2 text-sm">受取利息･配当金</Label>
                <NumericInput
                  key={`interestIncome-${clearKey}`}
                  className="col-start-3 text-right"
                  value={incomeStatement.interestIncome || undefined}
                  onValueChange={(value) =>
                    updateIncomeStatement((prev) => ({
                      ...prev,
                      interestIncome: value || 0,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="col-span-2 text-sm">支払利息</Label>
                <NumericInput
                  key={`interestExpense-${clearKey}`}
                  className="col-start-3 text-right"
                  value={incomeStatement.interestExpense || undefined}
                  onValueChange={(value) =>
                    updateIncomeStatement((prev) => ({
                      ...prev,
                      interestExpense: value || 0,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="col-span-2 text-sm">有価証券売却益</Label>
                <NumericInput
                  key={`securitiesGain-${clearKey}`}
                  className="col-start-3 text-right"
                  value={incomeStatement.securitiesGain || undefined}
                  onValueChange={(value) =>
                    updateIncomeStatement((prev) => ({
                      ...prev,
                      securitiesGain: value || 0,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="col-span-2 text-sm">
                  有価証券売却損･評価損
                </Label>
                <NumericInput
                  key={`securitiesLoss-${clearKey}`}
                  className="col-start-3 text-right"
                  value={incomeStatement.securitiesLoss || undefined}
                  onValueChange={(value) =>
                    updateIncomeStatement((prev) => ({
                      ...prev,
                      securitiesLoss: value || 0,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="col-span-2 text-sm">固定資産売却益</Label>
                <NumericInput
                  key={`fixedAssetGain-${clearKey}`}
                  className="col-start-3 text-right"
                  value={incomeStatement.fixedAssetGain || undefined}
                  onValueChange={(value) =>
                    updateIncomeStatement((prev) => ({
                      ...prev,
                      fixedAssetGain: value || 0,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="col-span-2 text-sm">
                  固定資産売却損･廃棄損
                </Label>
                <NumericInput
                  key={`fixedAssetLoss-${clearKey}`}
                  className="col-start-3 text-right"
                  value={incomeStatement.fixedAssetLoss || undefined}
                  onValueChange={(value) =>
                    updateIncomeStatement((prev) => ({
                      ...prev,
                      fixedAssetLoss: value || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg border-b mt-12 pb-2">
                【前期の利益処分計算書】
              </h3>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="col-span-2 text-sm">配当金の当期支出額</Label>
                <NumericInput
                  key={`dividends-${clearKey}`}
                  className="col-start-3 text-right"
                  value={appropriation.dividends || undefined}
                  onValueChange={(value) =>
                    updateAppropriation((prev) => ({
                      ...prev,
                      dividends: value || 0,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2">
                <Label className="col-span-2 text-sm">
                  役員賞与の当期支出額
                </Label>
                <NumericInput
                  key={`executiveBonuses-${clearKey}`}
                  className="col-start-3 text-right"
                  value={appropriation.executiveBonuses || undefined}
                  onValueChange={(value) =>
                    updateAppropriation((prev) => ({
                      ...prev,
                      executiveBonuses: value || 0,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="col-span-5 p-6 min-h-[800px] overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-lg border-b pb-2">
                【キャシュフロー計算書】
              </h3>
              <h4 className="font-semibold mt-4 mb-4">
                I. 営業活動によるキャッシュ・フロー
              </h4>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">税引前当期純利益</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    incomeStatement.pretaxIncome
                  )}`}
                >
                  {(incomeStatement.pretaxIncome || 0).toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">減価償却費</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    incomeStatement.depreciation
                  )}`}
                >
                  {(incomeStatement.depreciation || 0).toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">退職給付引当金</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    retirementBenefitsChange
                  )}`}
                >
                  {retirementBenefitsChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">賞与引当金</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    bonusReserveChange
                  )}`}
                >
                  {bonusReserveChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  受取利息･受取配当金
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    interestIncome
                  )}`}
                >
                  {interestIncome.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">支払利息</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    incomeStatement.interestExpense
                  )}`}
                >
                  {(incomeStatement.interestExpense || 0).toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  有価証券売却損益・評価損
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    securitiesGainLoss
                  )}`}
                >
                  {securitiesGainLoss.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  固定資産売却損益・廃棄損
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    fixedAssetGainLoss
                  )}`}
                >
                  {fixedAssetGainLoss.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  繰延ヘッジ損益の増減
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    treasuryStockChange
                  )}`}
                >
                  {treasuryStockChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  売上債権減少 (△増加)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    receivablesChange
                  )}`}
                >
                  {receivablesChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  棚卸資産減少 (△増加)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    inventoryChange
                  )}`}
                >
                  {inventoryChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  その他流動資産減少 (△増加)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    otherCurrentAssetsChange
                  )}`}
                >
                  {otherCurrentAssetsChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  繰延資産減少 (△増加)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    deferredAssetsChange
                  )}`}
                >
                  {deferredAssetsChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  仕入債務増加 (△減少)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    accountsPayableChange
                  )}`}
                >
                  {accountsPayableChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  その他の流動負債増加 (△減少)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    otherCurrentLiabilitiesChange
                  )}`}
                >
                  {otherCurrentLiabilitiesChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  その他の固定負債増加 (△減少)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    otherFixedLiabilitiesChange
                  )}`}
                >
                  {otherFixedLiabilitiesChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">役員賞与</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    executiveBonuses
                  )}`}
                >
                  {executiveBonuses.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-4 mb-0">
                <Label className="col-span-2 text-sm">小 計</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    operatingSubtotal1
                  )}`}
                >
                  {operatingSubtotal1.toLocaleString()}
                </div>
              </div>
              <hr className="mt-4" />
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  利息及び配当金の受取額
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    incomeStatement.interestIncome
                  )}`}
                >
                  {(incomeStatement.interestIncome || 0).toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">利息の支払額</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    interestExpense
                  )}`}
                >
                  {interestExpense.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">法人税等の支払額</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    incomeTaxesPaid
                  )}`}
                >
                  {incomeTaxesPaid.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-4 mb-0">
                <Label className="col-span-2 text-sm">小 計</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    operatingSubtotal2
                  )}`}
                >
                  {(operatingSubtotal2 || 0).toLocaleString()}
                </div>
              </div>
              <hr className="mt-4" />
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">営業活動によるCF</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    totalOperatingCF
                  )}`}
                >
                  {totalOperatingCF.toLocaleString()}
                </div>
              </div>

              <h4 className="font-semibold mt-12 mb-4">
                II. 投資活動によるキャッシュ・フロー
              </h4>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  有形固定資産の減少 (△増加)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    tangibleAssetsChange
                  )}`}
                >
                  {tangibleAssetsChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  無形固定資産の減少 (△増加)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    intangibleAssetsChange
                  )}`}
                >
                  {intangibleAssetsChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  有価証券の減少 (△増加)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    securitiesChange
                  )}`}
                >
                  {securitiesChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  貸付金の減少 (△増加)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    loansChange
                  )}`}
                >
                  {loansChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  その他の固定資産の減少 (△増加)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    otherFixedAssetsChange
                  )}`}
                >
                  {otherFixedAssetsChange.toLocaleString()}
                </div>
              </div>
              <hr className="mt-4" />
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">投資活動によるCF</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    totalInvestingCF
                  )}`}
                >
                  {totalInvestingCF.toLocaleString()}
                </div>
              </div>

              <h4 className="font-semibold mt-12 mb-4">
                III. 財務活動によるキャッシュ・フロー
              </h4>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  短期借入金の増加 (△減少)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    shortTermBorrowingsChange
                  )}`}
                >
                  {shortTermBorrowingsChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  長期借入金･社債の増加 (△減少)
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    longTermBorrowingsChange
                  )}`}
                >
                  {longTermBorrowingsChange.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">増資</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    capitalIncrease
                  )}`}
                >
                  {capitalIncrease.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">支払配当金</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    dividendsPaid
                  )}`}
                >
                  {dividendsPaid.toLocaleString()}
                </div>
              </div>
              <hr className="mt-4" />
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">財務活動によるCF</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    totalFinancingCF
                  )}`}
                >
                  {totalFinancingCF.toLocaleString()}
                </div>
              </div>

              <h4 className="font-semibold mt-12 mb-4">IV. 現預金</h4>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">
                  現預金残高の増加（△減少）
                </Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    cashIncrease
                  )}`}
                >
                  {cashIncrease.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">期首現預金残高</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    currentAssets.prev.cash
                  )}`}
                >
                  {(currentAssets.prev.cash || 0).toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0">
                <Label className="col-span-2 text-sm">期末現預金残高</Label>
                <div
                  className={`text-right py-2 px-3 ${getValueColorClass(
                    currentAssets.current.cash
                  )}`}
                >
                  {(currentAssets.current.cash || 0).toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center ps-2 mb-0 pt-4 border-t">
                <Label className="col-span-2 text-sm">CF合計チェック</Label>
                <div
                  className={`col-start-3 text-sm text-right py-2 px-3 ${
                    isCashFlowBalanced ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCashFlowBalanced ? "OK" : "NG"}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
