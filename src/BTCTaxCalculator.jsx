import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const CONFIG = {
  2023: { taxLimit: 41000, healthCap: 78000 },
  2024: { taxLimit: 45000, healthCap: 82000 },
  2025: { taxLimit: 47537, healthCap: 84240 },
};

const format = (n) => n.toLocaleString("sk-SK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BTCTaxCalculator() {
  const [btcPrice, setBtcPrice] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [year, setYear] = useState(2025);

  const parsedBtc = parseFloat(btcPrice.replace(/\s/g, '').replace(',', '.')) || 0;
  const parsedCost = parseFloat(costBasis.replace(/\s/g, '').replace(',', '.')) || 0;

  const taxRateLow = 0.19;
  const taxRateHigh = 0.25;
  const healthRate = 0.14;

  const { taxLimit, healthCap } = CONFIG[year];
  const taxableIncome = Math.max(parsedBtc - parsedCost, 0);

  const incomeTax =
    taxableIncome <= taxLimit
      ? taxableIncome * taxRateLow
      : taxLimit * taxRateLow + (taxableIncome - taxLimit) * taxRateHigh;

  const healthBase = Math.min(taxableIncome, healthCap);
  const healthInsurance = healthBase * healthRate;
  const totalTax = incomeTax + healthInsurance;
  const netIncome = parsedBtc - totalTax;

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("Kalkulačka dane z predaja BTC", 10, 20, { encoding: "UTF-8" });
    doc.setFontSize(12);
    autoTable(doc, {
      startY: 30,
      head: [["Položka", "Hodnota"]],
      body: [
        ["Rok", year],
        ["Predajná cena BTC (€)", format(parsedBtc)],
        ["Nákupná cena (€)", format(parsedCost)],
        ["Zdaniteľný zisk (€)", format(taxableIncome)],
        ["Daň z príjmu (€)", format(incomeTax)],
        ["Zdravotné odvody (€)", format(healthInsurance)],
        ["Spolu daň + odvody (€)", format(totalTax)],
        ["Čistý zisk (€)", format(netIncome)],
      ],
    });
    doc.save(`btc-tax-report-${year}.pdf`);
  };

  const exportToExcel = () => {
    const data = [
      ["Rok", year],
      ["Predajná cena BTC (€)", parsedBtc],
      ["Nákupná cena (€)", parsedCost],
      ["Zdaniteľný zisk (€)", taxableIncome],
      ["Daň z príjmu (€)", incomeTax],
      ["Zdravotné odvody (€)", healthInsurance],
      ["Spolu daň + odvody (€)", totalTax],
      ["Čistý zisk (€)", netIncome],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BTC Daň");
    XLSX.writeFile(workbook, `btc-tax-report-${year}.xlsx`);
  };

  return (
    <div className="space-y-6 bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-center">Kalkulačka dane z predaja BTC</h1>
      <div className="space-y-4">
        <div>
          <label className="block font-semibold">Rok zdaňovania</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold">Cena predaja 1 BTC (€)</label>
          <input
            type="text"
            inputMode="decimal"
            value={btcPrice}
            onChange={(e) => setBtcPrice(e.target.value)}
            placeholder="Zadaj sumu"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">Nákupná cena / náklady (€)</label>
          <input
            type="text"
            inputMode="decimal"
            value={costBasis}
            onChange={(e) => setCostBasis(e.target.value)}
            placeholder="Zadaj sumu"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="pt-4 space-y-2 text-sm text-gray-800">
          <p><strong>Zdaniteľný zisk:</strong> {format(taxableIncome)} €</p>
          <p><strong>Daň z príjmu:</strong> {format(incomeTax)} €</p>
          <p><strong>Zdravotné odvody:</strong> {format(healthInsurance)} €</p>
          <p><strong>Spolu daň + odvody:</strong> {format(totalTax)} €</p>
          <p className="text-lg sm:text-xl font-semibold text-green-700"><strong>Čistý zisk po zdanení:</strong> {format(netIncome)} €</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <button onClick={exportToPDF} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Exportovať do PDF
          </button>
          <button onClick={exportToExcel} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
            Exportovať do Excelu
          </button>
        </div>
      </div>
    </div>
  );
}
