"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

interface StakeholderScorecard {
  id: number;
  target_code: string;
  metric: string;
  office_target: string;
  status: string;
  key_performance_indicator: string;
  target_performance: string;
  actual_performance: string;
}

export default function Stakeholder() {
  const { data: session, status, update } = useSession();
  console.log("useSession Hook session object", session);
  let user;
  if (session?.user?.name) user = JSON.parse(session?.user?.name as string);
  const department_id = user?.department_id;

  // open modal
  const [stakeholderModalOpen, setStakeholderModalOpen] = useState(false);

  // stakeholder values
  const [stakeholderTargetCode, setStakeholderTargetCode] = useState("");
  const [stakeholderMetric, setStakeholderMetric] = useState("");
  const [stakeholderOfficeTarget, setStakeholderOfficeTarget] = useState("");
  const [stakeholderTargetPerformance, setStakeholderTargetPerformance] =
    useState("");
  const [stakeholderStatus, setStakeholderStatus] = useState("");
  const [stakeholderKPI, setStakeholderKPI] = useState("");
  const [stakeholderActualPerformance, setStakeholderActualPerformance] =
    useState("");
  const [stakeholderLevelOfAttainment, setStakeholderLevelOfAttainment] =
    useState("");

  //stakeholder scorecards
  const [stakeholderSavedScorecards, setStakeholderSavedScorecards] = useState<
    StakeholderScorecard[]
  >([]);

  //for edit
  const [stakeholderEditID, setStakeholderEditID] = useState(0);
  const [stakeholderEditMode, setStakeholderEditMode] =
    useState<StakeholderScorecard | null>(null); // Track edit mode

  const handleStakeholderCloseModal = () => {
    setStakeholderModalOpen(false);
    setStakeholderEditMode(null); // Reset edit mode
  };

  // const handleStartDateChange = (date: Date | null) => {
  //   console.log("Selected Start Date", date);
  //   if (date) {
  //     // Convert the selected date to UTC before saving it
  //     const utcDate = new Date(
  //       Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  //     );
  //     setStakeholderStartDate(utcDate);
  //   } else {
  //     setStakeholderStartDate(new Date());
  //   }
  // };

  // const handleCompletionDateChange = (date: Date | null) => {
  //   console.log("Selected Start Date", date);
  //   if (date) {
  //     // Convert the selected date to UTC before saving it
  //     const utcDate = new Date(
  //       Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  //     );
  //     setStakeholderTargetCompletionDate(utcDate);
  //   } else {
  //     //@ts-ignore
  //     setStakeholderTargetCompletionDate(null);
  //   }
  // };

  const handleStakeholderAddMoreScorecard = async () => {
    setStakeholderTargetCode("");
    setStakeholderMetric("");
    //@ts-ignore
    //setStakeholderTargetCompletionDate(null);
    setStakeholderOfficeTarget("");
    setStakeholderTargetPerformance("");
    setStakeholderStatus("");
    setStakeholderKPI("");
    setStakeholderActualPerformance("");
    setStakeholderLevelOfAttainment("");
    setStakeholderEditMode(null);
    setStakeholderModalOpen(true);
  };

  // Determine which function to call when the save button is clicked
  const handleSaveButtonClick = () => {
    if (stakeholderEditMode) {
      handleStakeholderUpdateScorecard();
    } else {
      handleStakeholderSaveScorecard();
    }
  };

  const calculateStakeholderLevelOfAttainment = (
    actualStakeholderPerformance: number,
    targetStakeholderPerformance: number
  ): string => {
    const levelOfAttainmentStakeholder =
      (actualStakeholderPerformance / targetStakeholderPerformance) * 100;
    return levelOfAttainmentStakeholder.toFixed(2);
  };

  // Fetch the saved financial scorecards from the server
  useEffect(() => {
    const fetchStakeholderScorecards = async () => {
      if (!department_id) {
        console.log("Department ID is not available yet.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/bsc/stakeholder/get/${department_id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch stakeholder scorecards");
        }
        const data = await response.json();
        setStakeholderSavedScorecards(data);
      } catch (error) {
        console.error("Error fetching stakeholder scorecards:", error);
      }
    };

    fetchStakeholderScorecards();
  }, [department_id]);

  const handleStakeholderEditScorecard = (scorecard: StakeholderScorecard) => {
    setStakeholderTargetCode(scorecard.target_code);
    setStakeholderMetric(scorecard.metric);
    setStakeholderOfficeTarget(scorecard.office_target);
    setStakeholderStatus(scorecard.status);
    setStakeholderKPI(scorecard.key_performance_indicator);
    setStakeholderTargetPerformance(scorecard.target_performance);
    setStakeholderActualPerformance(scorecard.actual_performance);
    setStakeholderEditMode(scorecard);
    setStakeholderEditID(scorecard.id);
    setStakeholderModalOpen(true);
  };

  const handleStakeholderSaveScorecard = async () => {
    // Check if all fields are filled
    if (
      !stakeholderTargetCode ||
      !stakeholderMetric ||
      !stakeholderOfficeTarget ||
      !stakeholderTargetPerformance ||
      !stakeholderStatus ||
      !stakeholderKPI ||
      !stakeholderActualPerformance
    ) {
      toast.error(
        "Please fill in all fields and ensure performance values do not exceed its limit."
      );
      return;
    }

    try {
      // Send the POST request to the server
      const response = await fetch(
        "http://localhost:8080/bsc/stakeholderBsc/insert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            department: { id: department_id },
            target_code: stakeholderTargetCode,
            metric: stakeholderMetric,
            office_target: stakeholderOfficeTarget,
            status: stakeholderStatus,
            key_performance_indicator: stakeholderKPI,
            target_performance: stakeholderTargetPerformance,
            actual_performance: stakeholderActualPerformance,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to save stakeholder scorecard");
      }

      const savedScorecard = await response.json();
      setStakeholderSavedScorecards([
        ...stakeholderSavedScorecards,
        savedScorecard,
      ]);
      toast.success("Stakeholder scorecard saved successfully");
      handleStakeholderCloseModal();
    } catch (error) {
      console.error("Error saving stakeholder scorecard:", error);
      toast.error("Error saving stakeholder scorecard");
    }
  };

  const handleStakeholderUpdateScorecard = async () => {
    if (!stakeholderEditMode) return;

    const updatedScorecard: StakeholderScorecard = {
      ...stakeholderEditMode,
      target_code: stakeholderTargetCode,
      metric: stakeholderMetric,
      office_target: stakeholderOfficeTarget,
      status: stakeholderStatus,
      key_performance_indicator: stakeholderKPI,
      target_performance: stakeholderTargetPerformance,
      actual_performance: stakeholderActualPerformance,
    };

    try {
      const response = await fetch(
        `http://localhost:8080/bsc/stakeholder/update/${stakeholderEditID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedScorecard),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update stakeholder scorecard");
      }

      // Update the state with the updated scorecard
      const updatedScorecards = stakeholderSavedScorecards.map((scorecard) =>
        scorecard.id === stakeholderEditID ? updatedScorecard : scorecard
      );

      setStakeholderSavedScorecards(updatedScorecards);
      toast.success("Stakeholder scorecard updated successfully");
      handleStakeholderCloseModal();
    } catch (error) {
      console.error("Error updating stakeholder scorecard:", error);
      toast.error("Error updating stakeholder scorecard");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        <div className="flex flex-row">
          <div className="flex flex-row p-1 w-[85rem] h-auto">
            <img
              src="/stakeholder.png"
              alt=""
              className=" h-[5rem] mb-5 mr-5 mt-[-0.6rem]"
            />
            <div className="flex flex-col">
              <span className="font-bold text-[1.3rem] text-[rgb(59,59,59)] ml-[-0.5rem]">
                Stakeholder Scorecard Overview
              </span>
              <span className="font-regular text-[1rem] text-[rgb(59,59,59)] ml-[-0.5rem]">
                Evaluates value delivered to stakeholders, including customers.
              </span>
            </div>
          </div>
          <div className="flex flex-row self-start box-sizing-border mt-5 mb-5">
            {/* Add More Scorecard Button */}
            <div className="flex flex-row gap-5 rounded-full w-[2.5rem] h-[2.5rem] bg-[#ff7b00d3] ml-[5rem] pl-[0.25rem] pr-1 pt-1 pb-1">
              <button
                className="text-white w-[3rem] h-6 cursor-pointer"
                onClick={handleStakeholderAddMoreScorecard}
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
            Stakeholder Office Target
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
        {stakeholderSavedScorecards &&
          stakeholderSavedScorecards.length > 0 &&
          stakeholderSavedScorecards.map((scorecard, index) => {
            if (!scorecard) return null;
            const levelOfAttainment = calculateStakeholderLevelOfAttainment(
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
                        onClick={() =>
                          handleStakeholderEditScorecard(scorecard)
                        }
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

      {stakeholderModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-8 rounded-lg z-10 h-[50rem] w-[96rem]">
            <div className="flex flex-row">
              <h2 className="text-2xl mb-10 font-semibold">Financial</h2>
              <button
                onClick={handleStakeholderCloseModal}
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
                  value={stakeholderTargetCode}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[25rem]"
                  onChange={(e) => setStakeholderTargetCode(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <span className="mr-3 break-words font-regular text-md text-[#000000]">
                  Metric / Unit of Measure
                  <span className="text-[#DD1414]">*</span>
                </span>
                <select
                  value={stakeholderMetric || ""}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[25rem]"
                  onChange={(e) => setStakeholderMetric(e.target.value)}
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
            </div>
            <span className="mr-3 break-words font-regular text-md text-[#000000] mt-10">
              Office Target
              <span className="text-[#DD1414]">*</span>
            </span>
            <textarea
              value={stakeholderOfficeTarget}
              className="border border-gray-300 px-3 py-2 pl-2 pr-2 mt-1 rounded-lg w-[91rem] h-[10rem]"
              onChange={(e) => setStakeholderOfficeTarget(e.target.value)}
            />
            <div className=" mt-10 flex flex-row gap-36">
              <div className="flex flex-col">
                <span className="mr-3 break-words font-regular text-md text-[#000000]">
                  Status
                  <span className="text-[#DD1414]">*</span>
                </span>
                <select
                  value={stakeholderStatus || ""}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[41rem]"
                  onChange={(e) => setStakeholderStatus(e.target.value)}
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
                  value={stakeholderKPI}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[41rem]"
                  onChange={(e) => setStakeholderKPI(e.target.value)}
                />
              </div>
            </div>
            <div className=" mt-10 flex flex-row gap-36">
              <div className="flex flex-col">
                <span className="mr-3 break-words font-regular text-md text-[#000000]">
                  Target Performance
                  <span className="text-[#DD1414]">*</span>
                </span>
                {stakeholderMetric === "Percentage" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter the actual performance as a percentage without
                    including the &apos;%&apos; symbol.
                  </span>
                )}
                {stakeholderMetric === "Count" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a whole number (e.g., 10).
                  </span>
                )}
                {stakeholderMetric === "Rating" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a number from 1 to 5, allowing one decimal
                    point (e.g., 3.5).
                  </span>
                )}
                {stakeholderMetric === "Score" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a score from 1 to 10, allowing one decimal
                    point (e.g., 7.5).
                  </span>
                )}
                {stakeholderMetric === "Succession Plan" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a numeric value to represent the status of the
                    succession plan. Ensure the value accurately reflects
                    readiness or progress.
                  </span>
                )}
                <input
                  type="number"
                  value={stakeholderTargetPerformance}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[41rem]"
                  onChange={(e) => {
                    const maxLimit =
                      stakeholderMetric === "Percentage"
                        ? 100
                        : stakeholderMetric === "Rating"
                        ? 10
                        : stakeholderMetric === "Score"
                        ? 20
                        : 1000;

                    let value = parseFloat(e.target.value);

                    // Apply min/max limits for all metrics
                    value = Math.min(value, maxLimit);

                    if (
                      stakeholderMetric === "Rating" ||
                      stakeholderMetric === "Score"
                    ) {
                      value = Math.min(value, maxLimit);
                      value = Math.ceil(value * 10) / 10; // Rounds up to the nearest tenth
                    }

                    setStakeholderTargetPerformance(value.toString());
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="mr-3 break-words font-regular text-md text-[#000000]">
                  Actual Performance
                  <span className="text-[#DD1414]">*</span>
                </span>
                {stakeholderMetric === "Percentage" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter the actual performance as a percentage without
                    including the &apos;%&apos; symbol.
                  </span>
                )}
                {stakeholderMetric === "Count" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a whole number (e.g., 10).
                  </span>
                )}
                {stakeholderMetric === "Rating" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a number from 1 to 5, allowing one decimal
                    point (e.g., 3.5).
                  </span>
                )}
                {stakeholderMetric === "Score" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a score from 1 to 10, allowing one decimal
                    point (e.g., 7.5).
                  </span>
                )}
                {stakeholderMetric === "Succession Plan" && (
                  <span className="mr-3 break-words font-regular italic text-sm text-[#2c2c2c]">
                    Please enter a numeric value to represent the status of the
                    succession plan. Ensure the value accurately reflects
                    readiness or progress.
                  </span>
                )}
                <input
                  type="number"
                  value={stakeholderActualPerformance}
                  className="border border-gray-300 px-3 py-2 mt-1 rounded-lg w-[41rem]"
                  onChange={(e) => {
                    const maxLimit =
                      stakeholderMetric === "Percentage"
                        ? 100
                        : stakeholderMetric === "Rating"
                        ? 10
                        : stakeholderMetric === "Score"
                        ? 20
                        : 1000;

                    let value = parseFloat(e.target.value);

                    // Apply min/max limits for all metrics
                    value = Math.min(value, maxLimit);

                    if (
                      stakeholderMetric === "Rating" ||
                      stakeholderMetric === "Score"
                    ) {
                      value = Math.min(value, maxLimit);
                      value = Math.ceil(value * 10) / 10; // Rounds up to the nearest tenth
                    }

                    setStakeholderActualPerformance(value.toString());
                  }}
                />
              </div>
            </div>
            <div className="flex flex-row justify-center mt-10 gap-10">
              <button
                onClick={handleStakeholderCloseModal}
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
                {stakeholderEditMode ? "Edit" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
