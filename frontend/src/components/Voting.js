"use client"

const { useState } = require("react")
const { Button } = require("@/components/ui/button")
const { Input } = require("@/components/ui/input")
const { Label } = require("@/components/ui/label")
const { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } = require("@/components/ui/select")

function VotingComponent() {
  const [selectedPerson, setSelectedPerson] = useState("")
  const [amount, setAmount] = useState("")
  const [isVotingEnabled, setIsVotingEnabled] = useState(false)

  const people = [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
    { id: "3", name: "Charlie" },
    { id: "4", name: "Diana" },
  ]

  const handleToggleVoting = () => {
    setIsVotingEnabled(!isVotingEnabled)
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="space-y-2">
        <Label htmlFor="person-select">Select Person</Label>
        <Select value={selectedPerson} onValueChange={setSelectedPerson}>
          <SelectTrigger id="person-select">
            <SelectValue placeholder="Select a person" />
          </SelectTrigger>
          <SelectContent>
            {people.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount-input">Amount</Label>
        <Input
          id="amount-input"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <Button onClick={handleToggleVoting} variant={isVotingEnabled ? "destructive" : "default"} className="w-full">
        {isVotingEnabled ? "Turn Voting Off" : "Turn Voting On"}
      </Button>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Voting is currently <span className="font-semibold">{isVotingEnabled ? "enabled" : "disabled"}</span>
      </div>
    </div>
  )
}

module.exports = VotingComponent