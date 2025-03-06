export default function SignUp() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white w-[420px] p-8 rounded-xl shadow-xl">
                {/* Title */}
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                    Sign Up
                </h2>

                {/* Form */}
                <form>
                    {/* First & Last Name */}
                    <div className="flex gap-4 mb-4">
                        <div className="w-1/2">
                            <label htmlFor="fname" className="block mb-2 text-sm font-semibold text-gray-700">
                                First Name
                            </label>
                            <input 
                                type="text" 
                                id="fname" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                required 
                            />
                        </div>
                        <div className="w-1/2">
                            <label htmlFor="lname" className="block mb-2 text-sm font-semibold text-gray-700">
                                Last Name
                            </label>
                            <input 
                                type="text" 
                                id="lname" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                required 
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                            required 
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">
                            Password
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                            required 
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                        <label htmlFor="repeat-password" className="block mb-2 text-sm font-semibold text-gray-700">
                            Confirm Password
                        </label>
                        <input 
                            type="password" 
                            id="repeat-password" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                            required 
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-md text-sm px-5 py-2.5 text-center transition shadow-md"
                    >
                        Register New Account
                    </button>
                </form>

                {/* Already Have an Account */}
                <p className="mt-4 text-sm text-gray-600 text-center">
                    Already have an account?{" "}
                    <a href="/Login" className="text-blue-600 hover:underline font-semibold transition">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}
