import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate
}));

import LoginPage from "./LoginPage";

beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
        value: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            clear: jest.fn()
        },
        writable: true
    });
});

describe("LoginPage Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders Login form with email and name inputs and Login button", () => {
        render(<LoginPage setIsAuthenticated={jest.fn()} />);
        expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Name/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    });

    test("shows error message when user does not exist", async () => {
        jest.spyOn(axios, "get").mockResolvedValueOnce({ data: {} });
        const setIsAuthenticatedMock = jest.fn();
        render(<LoginPage setIsAuthenticated={setIsAuthenticatedMock} />);
        userEvent.type(screen.getByPlaceholderText(/Email/i), "test@example.com");
        userEvent.type(screen.getByPlaceholderText(/Name/i), "TestUser");
        userEvent.click(screen.getByRole("button", { name: /Login/i }));
        await waitFor(() => {
            expect(screen.getByText(/Invalid email or name/i)).toBeInTheDocument();
        });
        expect(setIsAuthenticatedMock).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("logs in successfully and navigates to home when user exists", async () => {
        const mockData = {
            user1: { email: "test@example.com", name: "TestUser" }
        };
        jest.spyOn(axios, "get").mockResolvedValueOnce({ data: mockData });
        const setIsAuthenticatedMock = jest.fn();
        render(<LoginPage setIsAuthenticated={setIsAuthenticatedMock} />);
        userEvent.type(screen.getByPlaceholderText(/Email/i), "test@example.com");
        userEvent.type(screen.getByPlaceholderText(/Name/i), "TestUser");
        userEvent.click(screen.getByRole("button", { name: /Login/i }));
        await waitFor(() => {
            expect(setIsAuthenticatedMock).toHaveBeenCalledWith(true);
            expect(window.localStorage.setItem).toHaveBeenCalledWith("username", "TestUser");
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
        expect(screen.queryByText(/Invalid email or name/i)).not.toBeInTheDocument();
    });
});
