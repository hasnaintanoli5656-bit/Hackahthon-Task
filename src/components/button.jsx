
const button = ({title , handler}) => {
  return (
    <button
            type="button"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            onClick={handler}
          >
            {title}
          </button>
  )
}

export default button
