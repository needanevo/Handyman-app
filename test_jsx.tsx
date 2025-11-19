// Test fragment to verify JSX syntax
{!user && (
  <>
    <Controller
      control={control}
      name="password"
      render={({ field: { onChange, value } }) => (
        <Input
          label="Password"
          value={value}
        />
      )}
    />
    <Controller
      control={control}
      name="confirmPassword"
      render={({ field: { onChange, value } }) => (
        <Input
          label="Confirm Password"
          value={value}
        />
      )}
    />
  </>
)}
