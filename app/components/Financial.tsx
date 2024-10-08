"use client";
import { useSession } from "next-auth/react";
import { use, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

interface FinancialScorecard {
  id: number;
  target_code: string;
  metric: string;
  office_target: string;
  status: string;
  key_performance_indicator: string;
  target_performance: string;
  actual_performance: string;
}

export default function Financial() {
  const { data: session, status, update } = useSession();
  console.log("useSession Hook session object", session);
  let user;
  if (session?.user?.name) user = JSON.parse(session?.user?.name as string);
  const department_id = user?.department_id;

  // open modal
  const [financialModalOpen, setFinancialModalOpen] = useState(false);
  // financial values
  const [financialTargetCode, setFinancialTargetCode] = useState("");
  const [financialMetric, setFinancialMetric] = useState("");
  const [financialTargetCompletionDate, setFinancialTargetCompletionDate] =
    useState(new Date());
  const [financialOfficeTarget, setFinancialOfficeTarget] = useState("");
  const [financialStatus, setFinancialStatus] = useState("");
  const [financialKPI, setFinancialKPI] = useState("");
  const [financialTargetPerformance, setFinancialTargetPerformance] =
    useState("");
  const [financialActualPerformance, setFinancialActualPerformance] =
    useState("");
  const [financialLevelOfAttainment, setFinancialLevelOfAttainment] =
    useState("");

  // financial scorecards
  const [financialSavedScorecards, setFinancialSavedScorecards] = useState<
    FinancialScorecard[]
  >([]);

  //for edit
  const [financialEditID, setFinancialEditID] = useState(0); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  const [financialEditMode, setFinancialEditMode] =
    useState<FinancialScorecard | null>(null);

  const handleFinancialCloseModal = () => {
    setFinancialModalOpen(false);
    setFinancialEditMode(null); // Reset edit mode
  };

  // const handleStartDateChange = (date: Date | null) => {
  //   console.log("Selected Start Date", date);
  //   if (date) {
  //     // Convert the selected date to UTC before saving it
  //     const utcDate = new Date(
  //       Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  //     );
  //     setFinancialStartDate(utcDate);
  //   } else {
  //     setFinancialStartDate(new Date());
  //   }
  // };

  // const handleCompletionDateChange = (date: Date | null) => {
  //   console.log("Selected Completion Date", date);
  //   if (date) {
  //     // Convert the selected date to UTC before saving it
  //     const utcDate = new Date(
  //       Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  //     );
  //     setFinancialTargetCompletionDate(utcDate);
  //   } else {
  //     //@ts-ignore
  //     setFinancialTargetCompletionDate(null);
  //   }
  // };

  // mo add ug scorecard : open modal
  const handleFinancialAddMoreScorecard = async () => {
    setFinancialTargetCode("");
    setFinancialMetric("");
    //setFinancialTargetCompletionDate(null);
    setFinancialOfficeTarget("");
    setFinancialStatus("");
    setFinancialKPI("");
    setFinancialTargetPerformance("");
    setFinancialActualPerformance("");
    setFinancialEditMode(null);
    setFinancialModalOpen(true);
  };

  // Determine which function to call when the save button is clicked
  const handleSaveButtonClick = () => {
    if (financialEditMode) {
      // If we're in edit mode, update the existing scorecard
      handleFinancialUpdateScorecard();
    } else {
      // If we're not in edit mode, save as a new scorecard
      handleFinancialSaveScorecard();
    }
  };
  // to get the level of attainment kay you need to divide actual performance to target performance and need sad siya percentage
  const calculateFinancialLevelOfAttainment = (
    actualFinancialPerformance: number,
    targetFinancialPerformance: number
  ): string => {
    const levelOfAttainmentFinancial =
      (actualFinancialPerformance / targetFinancialPerformance) * 100;
    return levelOfAttainmentFinancial.toFixed(2);
  };

  // Fetch the saved financial scorecards from the server
  useEffect(() => {
    const fetchFinancialScorecards = async () => {
      if (!department_id) {
        console.log("Department ID is not available yet.");
        return;
      }
      console.log(
        "Fetching financial scorecards for department ID:",
        department_id
      );
      try {
        const response = await fetch(
          `http://localhost:8080/bsc/financial/get/${department_id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch financial scorecards");
        }
        const data = await response.json();
        console.log("Financial scorecards data:", data);
        setFinancialSavedScorecards(data);
      } catch (error) {
        console.error("Error fetching financial scorecards:", error);
      }
    };

    fetchFinancialScorecards();
  }, [department_id]);

  const handleFinancialEditScorecard = (scorecard: FinancialScorecard) => {
    setFinancialTargetCode(scorecard.target_code);
    setFinancialMetric(scorecard.metric);
    setFinancialOfficeTarget(scorecard.office_target);
    setFinancialStatus(scorecard.status);
    setFinancialKPI(scorecard.key_performance_indicator);
    setFinancialTargetPerformance(scorecard.target_performance);
    setFinancialActualPerformance(scorecard.actual_performance);
    setFinancialEditMode(scorecard);
    setFinancialEditID(scorecard.id);
    setFinancialModalOpen(true);
  };

  const handleFinancialSaveScorecard = async () => {
    // Check if all fields are filled
    if (
      !financialTargetCode ||
      !financialMetric ||
      !financialOfficeTarget ||
      !financialTargetPerformance ||
      !financialStatus ||
      !financialKPI ||
      !financialActualPerformance ||
      parseFloat(financialTargetPerformance) > 100 ||
      parseFloat(financialActualPerformance) > 100
    ) {
      toast.error(
        "Please fill in all fields and ensure performance values do not exceed 100."
      );
      return;
    }

    try {
      // Send the POST request to the server
      const response = await fetch(
        "http://localhost:8080/bsc/financialBsc/insert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            department: { id: department_id }, // Ensure you have this variable defined or passed in
            target_code: financialTargetCode,
            office_target: financialOfficeTarget,
            metric: financialMetric,
            status: financialStatus,
            key_performance_indicator: financialKPI,
            target_performance: financialTargetPerformance,
            actual_performance: financialActualPerformance,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save financial scorecard");
      }

      const savedScorecard = await response.json();
      setFinancialSavedScorecards([
        ...financialSavedScorecards,
        savedScorecard,
      ]);
      toast.success("Financial scorecard saved successfully");
      handleFinancialCloseModal();
    } catch (error) {
      console.error("Error saving financial scorecard:", error);
      toast.error("Error saving financial scorecard");
    }
  };

  const handleFinancialUpdateScorecard = async () => {
    if (!financialEditMode) return;

    const updatedScorecard: FinancialScorecard = {
      ...financialEditMode,
      target_code: financialTargetCode,
      metric: financialMetric,
      office_target: financialOfficeTarget,
      status: financialStatus,
      key_performance_indicator: financialKPI,
      target_performance: financialTargetPerformance,
      actual_performance: financialActualPerformance,
    };

    try {
      const response = await fetch(
        `http://localhost:8080/bsc/financial/update/${financialEditID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedScorecard),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update financial scorecard");
      }

      // Update the state with the updated scorecard
      const updatedScorecards = financialSavedScorecards.map((scorecard) =>
        scorecard.id === financialEditID ? updatedScorecard : scorecard
      );

      setFinancialSavedScorecards(updatedScorecards);
      toast.success("Financial scorecard updated successfully");
      handleFinancialCloseModal();
    } catch (error) {
      console.error("Error updating financial scorecard:", error);
      toast.error("Error updating financial scorecard");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        <div className="flex flex-row">
          <div className="flex flex-row p-1 w-[85rem] h-auto">
            <img
              src="/financial.png"
              alt=""
              className=" h-[5rem] mb-5 mr-5 mt-[-0.6rem]"
            />
            <div className="flex flex-col">
              <span className="font-bold text-[1.3rem] text-[rgb(59,59,59)] ml-[-0.5rem]">
                Financial Scorecard Overview
              </span>
              <span className="font-regular text-[1rem] text-[rgb(59,59,59)] ml-[-0.5rem]">
                Measures financial performance and profitability.
              </span>
            </div>
          </div>
          <div className="flex flex-col self-start justify-end mt-5 mb-5">
            {/* Add More Scorecard Button */}
            <div className="flex flex-row gap-5 rounded-full w-[2.5rem] h-[2.5rem] bg-[#ff7b00d3] ml-[5rem] pl-[0.25rem] pr-1 pt-1 pb-1">
              <button
                className="text-[#ffffff] w-[3rem] h-6 cursor-pointer"
                onClick={handleFinancialAddMoreScorecard}
              >
                <div className="flex flex-row">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-8"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-row p-4 bg-[#fff6d1] text-[rgb(43,43,43)] ">
          <div className="w-[10rem] flex items-center font-bold">
            Target Code
          </div>
          <div className="w-[25rem] flex items-center font-bold mr-10">
            Financial Office Target
          </div>
          <div className="w-[10rem] flex items-center font-bold">Metric</div>
          <div className="w-[18rem] flex items-center font-bold">
            Target Performance
          </div>
          <div className="w-[13rem] flex items-center font-bold">
            Attainment
          </div>
          <div className="w-[10rem] flex items-center font-bold">Status</div>
        </div>
      </div>
      <div className="bg-[#ffffff] gap-2 w-[100%] h-[auto] flex flex-col pt-4 pr-3 pb-6 box-sizing-border rounded-lg overflow-y-auto overflow-x-hidden">
        {financialSavedScorecards &&
          financialSavedScorecards.length > 0 &&
          financialSavedScorecards.map((scorecard, index) => {
            if (!scorecard) return null; // Skip rendering if item is undefined
            // Calculate the level of attainment for the financial scorecard
            const levelOfAttainment = calculateFinancialLevelOfAttainment(
              parseFloat(scorecard.actual_performance),
              parseFloat(scorecard.target_performance)
            );

            // Validate the level of attainment to be between 1 and 100
            const validatedLevelOfAttainment = Math.min(
              Math.max(parseFloat(levelOfAttainment), 1),
              100
            );

            return (
              <div className="relative flex flex-col w-auto h-auto text-[rgb(43,43,43)]">
                <div
                  key={index}
                  className={`flex flex-row p-4 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#fff6d1]"
                  }`}
                >
                  <div className="flex flex-row w-full">
                    <div className="w-[10rem] flex items-center">
                      <span className="font-semibold text-gray-500">
                        {scorecard.target_code || "N/A"}:
                      </span>
                    </div>

                    <div className="w-[25.5rem] mr-10 flex items-center ">
                      <span className="font-semibold">
                        {scorecard.office_target &&
                        scorecard.office_target.length > 60
                          ? `${scorecard.office_target.substring(0, 60)}...`
                          : scorecard.office_target || "N/A"}
                      </span>
                    </div>

                    <div className="w-[13rem] flex items-center ">
                      <span className="font-semibold ">
                        {scorecard.metric || "N/A"}
                      </span>
                    </div>

                    <div className="w-[16rem] flex items-center">
                      <div className={"font-semibold"}>
                        {scorecard.metric === "Percentage"
                          ? `${scorecard.target_performance}%`
                          : scorecard.target_performance || "N/A"}
                      </div>
                    </div>

                    <div className="w-[10rem] flex items-center ">
                      <span className="font-semibold">
                        {validatedLevelOfAttainment || "N/A"}%
                      </span>
                    </div>

                    <div className="w-[8rem] flex items-center text-center">
                      <div className="font-semibold border rounded-lg bg-yellow-200 border-yellow-500 p-2 w-[10rem]">
                        {scorecard.status || "N/A"}
                      </div>
                    </div>

                    <div className="w-[5rem] flex items-center justify-end text-orange-700">
                      <button
                        onClick={() => handleFinancialEditScorecard(scorecard)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {financialModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-8 rounded-lg z-10 h-[50rem] w-[96rem]">
            <div className="flex flex-row">
              <h2 className="text-2xl mb-10 font-semibold">Financial</h2>
              <button
                onClick={handleFinancialCloseModal}
                className="ml-[85rem] mt-[-5rem] text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-row gap-32 mb-10">
              <div className="flex flex-col">
                <span className="mr-3 break-words font-regular text-md text-[#000000]">
                  Target Code
                  <span className="text-[#DD1414]">*</span>
                </span>
                <input
                  type="text"
                  value={financialTargetCode}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[25rem]"
                  onChange={(e) => setFinancialTargetCode(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <span className="mr-3 break-words font-regular text-md text-[#000000]">
                  Metric / Unit of Measure
                  <span className="text-[#DD1414]">*</span>
                </span>
                <select
                  value={financialMetric || ""}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[25rem]"
                  onChange={(e) => setFinancialMetric(e.target.value)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Count">Count</option>
                  <option value="Rating">Rating</option>
                  <option value="Score">Score</option>
                  <option value="Succession Plan">Succession Plan</option>
                </select>
              </div>
              {/* <div className="flex flex-col">
                <span className="mr-3 break-words font-regular text-md text-[#000000]">
                  Target Completion Date
                </span>
                <DatePicker
                  key={financialTargetCompletionDate?.toString()}
                  selected={financialTargetCompletionDate}
                  onChange={handleCompletionDateChange}
                  placeholderText="MM-DD-YYYY"
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[25rem]"
                />
              </div> */}
            </div>
            <span className="mr-3 break-words font-regular text-md text-[#000000] mt-10">
              Office Target
              <span className="text-[#DD1414]">*</span>
            </span>
            <textarea
              value={financialOfficeTarget}
              className="border border-gray-300 px-3 py-2 pl-2 pr-2 mt-1 rounded-lg w-[91rem] h-[10rem]"
              onChange={(e) => setFinancialOfficeTarget(e.target.value)}
            />
            <div className=" mt-10 flex flex-row gap-36">
              <div className="flex flex-col">
                <span className="mr-3 break-words font-regular text-md text-[#000000]">
                  Status
                  <span className="text-[#DD1414]">*</span>
                </span>
                <select
                  value={financialStatus || ""}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[41rem]"
                  onChange={(e) => setFinancialStatus(e.target.value)}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Not Achieved">Not Achieved</option>
                  <option value="Achieved">Achieved</option>
                </select>
              </div>
              {/* add KPI here */}
              <div className="flex flex-col">
                <span className="mr-3 break-words font-regular text-md text-[#000000]">
                  Key Performance Indicator
                  <span className="text-[#DD1414]">*</span>
                </span>
                <input
                  type="text"
                  value={financialKPI}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[41rem]"
                  onChange={(e) => setFinancialKPI(e.target.value)}
                />
              </div>
            </div>
            <div className=" mt-10 flex flex-row gap-36">
              <div className="flex flex-col">
                <span className="mr-3 break-words font-regular text-md text-[#000000]">
                  Target Performance
                  <span className="text-[#DD1414]">*</span>
                </span>
                {financialMetric === "Percentage" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter the actual performance as a percentage without
                    including the &apos;%&apos; symbol.
                  </span>
                )}
                {financialMetric === "Count" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a whole number (e.g., 10).
                  </span>
                )}
                {financialMetric === "Rating" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a number from 1 to 5, allowing one decimal
                    point (e.g., 3.5).
                  </span>
                )}
                {financialMetric === "Score" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a score from 1 to 10, allowing one decimal
                    point (e.g., 7.5).
                  </span>
                )}
                {financialMetric === "Succession Plan" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a numeric value to represent the status of the
                    succession plan. Ensure the value accurately reflects
                    readiness or progress.
                  </span>
                )}
                <input
                  type="number"
                  value={financialTargetPerformance}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[41rem]"
                  onChange={(e) => {
                    const maxLimit =
                      financialMetric === "Percentage"
                        ? 100
                        : financialMetric === "Rating"
                        ? 10
                        : financialMetric === "Score"
                        ? 20
                        : 1000;

                    let value = parseFloat(e.target.value);

                    // Apply min/max limits for all metrics
                    value = Math.min(value, maxLimit);

                    if (
                      financialMetric === "Rating" ||
                      financialMetric === "Score"
                    ) {
                      value = Math.min(value, maxLimit);
                      value = Math.ceil(value * 10) / 10; // Rounds up to the nearest tenth
                    }

                    setFinancialTargetPerformance(value.toString());
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="mr-3 break-words font-regular text-md text-[#000000]">
                  Actual Performance
                  <span className="text-[#DD1414]">*</span>
                </span>
                {financialMetric === "Percentage" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter the actual performance as a percentage without
                    including the &apos;%&apos; symbol.
                  </span>
                )}
                {financialMetric === "Count" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a whole number (e.g., 10).
                  </span>
                )}
                {financialMetric === "Rating" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a number from 1 to 5, allowing one decimal
                    point (e.g., 3.5).
                  </span>
                )}
                {financialMetric === "Score" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a score from 1 to 10, allowing one decimal
                    point (e.g., 7.5).
                  </span>
                )}
                {financialMetric === "Succession Plan" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a numeric value to represent the status of the
                    succession plan. Ensure the value accurately reflects
                    readiness or progress.
                  </span>
                )}
                <input
                  type="number"
                  value={financialActualPerformance}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[41rem]"
                  onChange={(e) => {
                    const maxLimit =
                      financialMetric === "Percentage"
                        ? 100
                        : financialMetric === "Rating"
                        ? 10
                        : financialMetric === "Score"
                        ? 20
                        : 1000;

                    let value = parseFloat(e.target.value);
                    
                    // Apply min/max limits for all metrics
                    value = Math.min(value, maxLimit);

                    if (
                      financialMetric === "Rating" ||
                      financialMetric === "Score"
                    ) {
                      value = Math.min(value, maxLimit);
                      value = Math.ceil(value * 10) / 10; // Rounds up to the nearest tenth
                    }

                    setFinancialActualPerformance(value.toString());
                  }}
                />
              </div>
            </div>
            <div className="flex flex-row justify-center mt-10 gap-10">
              <button
                onClick={handleFinancialCloseModal}
                className="bg-[#ffffff] text-[#962203] font-semibold hover:bg-[#AB3510] hover:text-[#ffffff] px-4 py-2 mt-4 rounded-lg w-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveButtonClick}
                className="text-[#ffffff] font-semibold px-4 py-2 mt-4 rounded-lg w-40"
                style={{
                  background: "linear-gradient(to left, #8a252c, #AB3510)",
                }}
              >
                {financialEditMode ? "Edit" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
