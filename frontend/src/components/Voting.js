import React, { useState } from "react";

export function Voting({ vote, issueTokens, authorized, balance, users }) {
  const [codinome, setCodinome] = useState("");
  const [amount, setAmount] = useState("");

  const handleVote = (event) => {
    event.preventDefault();
    if (codinome && amount) {
      console.log("entrou VOTE aqui");
      vote(codinome, amount);
    }
  };

  const handleIssueTokens = (event) => {
    event.preventDefault();
    if (codinome && amount) {
      console.log("entrou TOKEN aqui");
      issueTokens(codinome, amount);
    }
  };

  if (authorized)  {
    return (
      <div>
        <form>
          <div className="form-group">
            <label>Aluno</label>
            <select
              className="form-control"
              name="codinome"
              value={codinome}
              onChange={(e) => setCodinome(e.target.value)}
              required>
              {users.map((user, index) => (
                <option key={index} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Turings</label>
            <input
              className="form-control"
              type="float"
              step="1"
              name="amount"
              placeholder="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required/>
          </div>
          <div className="form-group d-flex mt-3">
            <button 
              className="btn border"  
              style={{ fontWeight: 'bold', border: '3px solidrgb(0, 224, 244)', margin: '10px' }}
              onClick={handleIssueTokens}>
              Emitir Tokens
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (!authorized && balance.gt(0)) {
    return (
      <div>
        <h4>Votar</h4>
        <form>
          <div className="form-group">
            <label>Codinome</label>
            <select
              className="form-control"
              name="codinome"
              value={codinome}
              onChange={(e) => setCodinome(e.target.value)}
              required
            >
              {users.map((user, index) => (
                <option key={index} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Turings</label>
            <input
              className="form-control"
              type="float"
              step="1"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group d-flex mt-3">
            <button className="btn btn-primary" onClick={handleVote}>
              Votar
            </button>
          </div>
        </form>
      </div>
    );
  }
  return null;
}