
const input = ({type, placeholder , value , handler , name}) => {
  return (
    <input
              type={type}
              name={name}
              placeholder={placeholder}
              value={value} 
              onChange={(e) => handler( name , e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
  )
}

export default input
