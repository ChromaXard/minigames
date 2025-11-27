"use client";

import React, { useState } from "react";
import {EyeIcon, EyeSlashIcon} from "@heroicons/react/24/outline";
export default function Form({
	inputs,
	onSubmitFn,
	formTitle,
	ref,
    submitButtonText
}: {
	inputs: { id: string; label: string; type: string, placeholder?: string }[];
	onSubmitFn: (e: React.FormEvent<HTMLFormElement>) => void;
	formTitle?: string;
	ref: React.Ref<HTMLFormElement>;
    submitButtonText?: string;
}) {
	const [passwordVisible, setPasswordVisible] = useState<boolean[]>([
		...Array(inputs.filter((input) => input.type === "password").length).fill(
			false
		),
	]);

	return (
		<div className="flex flex-col w-full rounded-md border-1 border-gray-300 max-w-3xl items-center justify-center self-center shadow-md p-6 bg-gray-50">
			{formTitle && <h2 className="text-2xl mb-4">{formTitle}</h2>}
			<form
				className="flex flex-col justify-center items-center gap-4 w-full max-w-xl"
				onSubmit={onSubmitFn}
				ref={ref}
			>
				{inputs.map((input, index) => (
					<div key={index} className="flex flex-col relative w-full">
						<label key={index} htmlFor={input.id} className="mb-1 font-medium">
							{input.label}
						</label>
						<div className="border border-gray-300 rounded flex flex-row items-center px-2 justify-center p-1">
							<input
								id={input.id}
								name={input.id}
								type={passwordVisible[index] ? "text" : input.type}
								className="focus:outline-none w-full"
								placeholder={input.placeholder}
							/>
							{input.type === "password" && (
								<button
									type="button"
									onClick={() => {
										const newVisibility = [...passwordVisible];
										newVisibility[index] = !newVisibility[index];
										setPasswordVisible(newVisibility);
									}}
									className="ml-1 border-l border-gray-300 pl-1 cursor-pointer"
								>
									{passwordVisible[index] ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
								</button>
							)}
						</div>
					</div>
				))}
				<button className="border-1 rounded-md p-1 w-fit cursor-pointer border-gray-300 bg-gray-100">{submitButtonText || "Envoyer"}</button>
			</form>
		</div>
	);
}
